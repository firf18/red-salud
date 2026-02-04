/**
 * 🏥 SERVICIO BACKEND: Verificación RIF con Puppeteer
 * 
 * Este servicio hace scraping del sistema SENIAT de Venezuela
 * para verificar los datos de contribuyentes.
 */

const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const { validarRif } = require('ve-check');

// Usar el plugin de sigilo (Stealth)
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Puppeteer optimizada para Railway/Docker
const PROXY_SERVER = process.env.PROXY_SERVER; // formato: http://usuario:pass@host:port o http://host:port
const PROXY_USER = process.env.PROXY_USERNAME;
const PROXY_PASS = process.env.PROXY_PASSWORD;

const PUPPETEER_CONFIG = {
    headless: 'new',
    executablePath: '/usr/bin/google-chrome', // Forzar uso de Chrome instalado
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
    ],
};

// Si hay proxy configurado, agregarlo a los argumentos
if (PROXY_SERVER) {
    // Extraer host de la URL del proxy si viene con auth (Puppeteer requiere auth aparte)
    let proxyHost = PROXY_SERVER;
    if (PROXY_SERVER.includes('@')) {
        proxyHost = 'http://' + PROXY_SERVER.split('@')[1];
    }
    PUPPETEER_CONFIG.args.push(`--proxy-server=${proxyHost}`);
}

const NAV_OPTIONS = {
    waitUntil: 'domcontentloaded', // Cambiado a domcontentloaded para mayor resiliencia
    timeout: 90000
};

const SENIAT_URL = "http://contribuyente.seniat.gob.ve/BuscaRif/BuscaRif.jsp";
const CAPTCHA_URL = "http://contribuyente.seniat.gob.ve/BuscaRif/Captcha.jsp";

// Almacén temporal de sesiones (en memoria, para simplificar)
const sessions = new Map();

/**
 * Endpoint: Health Check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'rif-verification' });
});

/**
 * Endpoint: Obtener Captcha
 * Inicia una sesión con el SENIAT y devuelve la imagen del captcha.
 */
app.get('/get-captcha', async (req, res) => {
    let browser;
    try {
        console.log('[SENIAT] Iniciando sesión para obtener captcha...');
        browser = await puppeteer.launch(PUPPETEER_CONFIG);
        const page = await browser.newPage();

        // Establecer timeouts explícitos para toda la página
        await page.setDefaultNavigationTimeout(90000);
        await page.setDefaultTimeout(90000);

        // Configurar un user-agent real para evitar bloqueos básicos
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Autenticar proxy si es necesario
        if (PROXY_USER && PROXY_PASS) {
            console.log('[SENIAT] Autenticando proxy...');
            await page.authenticate({ username: PROXY_USER, password: PROXY_PASS });
        }

        console.log('[SENIAT] Navegando a URL principal...');
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
            try {
                await page.goto(SENIAT_URL, NAV_OPTIONS);
                break;
            } catch (err) {
                console.log(`[SENIAT] Intento ${retryCount + 1} fallido: ${err.message}`);
                retryCount++;
                if (retryCount > maxRetries) throw err;
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        const cookies = await page.cookies();
        const jSessionId = cookies.find(c => c.name === 'JSESSIONID')?.value;

        if (!jSessionId) {
            const html = await page.content();
            console.log('[SENIAT DEBUG] Content summary:', html.substring(0, 500));
            throw new Error('No se pudo obtener la sesión (JSESSIONID). El portal podría estar caído o bloqueando el acceso.');
        }

        // Obtener la imagen del captcha mediante captura de pantalla del elemento
        console.log('[SENIAT] Capturando elemento de captcha...');
        await page.waitForSelector('img[src="Captcha.jpg"]', { timeout: 10000 });
        const captchaElement = await page.$('img[src="Captcha.jpg"]');

        if (!captchaElement) {
            throw new Error('No se encontró el elemento del captcha en la página');
        }

        const buffer = await captchaElement.screenshot();

        // Guardar sesión para validación posterior
        const sessionId = Math.random().toString(36).substring(7);
        sessions.set(sessionId, { cookies, timestamp: Date.now() });

        // Limpieza de sesiones antiguas (> 10 min)
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        for (const [id, data] of sessions.entries()) {
            if (data.timestamp < tenMinutesAgo) sessions.delete(id);
        }

        res.json({
            sessionId,
            captchaBase64: `data:image/png;base64,${buffer.toString('base64')}`
        });

    } catch (error) {
        console.error('[SENIAT Error]', error);

        let errorMessage = error.message;
        if (error.name === 'TimeoutError' || errorMessage.includes('timeout')) {
            errorMessage = "Tiempo de espera agotado. El portal del SENIAT podría estar bloqueando el acceso desde el servidor o estar fuera de servicio.";
        }

        res.status(500).json({ error: errorMessage });
    } finally {
        if (browser) await browser.close();
    }
});

/**
 * Endpoint: Validar RIF
 */
app.post('/validate', async (req, res) => {
    const { rif, captcha, sessionId } = req.body;
    const sessionData = sessions.get(sessionId);

    if (!sessionData) {
        return res.status(400).json({ error: 'Sesión expirada o inválida' });
    }

    let browser;
    try {
        console.log(`[SENIAT] Validando RIF: ${rif}`);
        browser = await puppeteer.launch(PUPPETEER_CONFIG);
        const page = await browser.newPage();

        await page.setDefaultNavigationTimeout(90000);
        await page.setDefaultTimeout(90000);

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        await page.setCookie(...sessionData.cookies);
        await page.goto(SENIAT_URL, NAV_OPTIONS);

        const cleanRif = rif.trim().replace(/-/g, "").toUpperCase();

        // Validación algorítmica previa con ve-check
        if (!validarRif(cleanRif)) {
            console.log(`[SENIAT] RIF Inválido (algoritmo): ${rif}`);
            return res.status(400).json({
                success: false,
                error: "El formato del RIF es inválido o el dígito verificador es incorrecto."
            });
        }

        // Llenar formulario
        await page.type('#p_rif', cleanRif);
        await page.type('#codigo', captcha);

        // Click en Buscar y esperar navegación
        await Promise.all([
            page.click('input[name="busca"]'),
            page.waitForNavigation(NAV_OPTIONS)
        ]);

        const html = await page.content();

        if (html.includes("incorrecto")) {
            return res.json({ success: false, error: "Código de seguridad incorrecto" });
        }

        // Extraer Razón Social
        const nameMatch = html.match(/Nombre\s+o\s+Raz..n\s+Social:.*?<b[^>]*>(.*?)<\/b>/si);
        let businessName = nameMatch ? nameMatch[1].trim() : null;

        if (businessName) {
            businessName = businessName
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/\s+/g, ' ');

            // Limpiar sesión usada
            sessions.delete(sessionId);

            return res.json({ success: true, businessName });
        }

        res.json({ success: false, error: "Contribuyente no encontrado o error en el portal" });

    } catch (error) {
        console.error('[SENIAT Validation Error]', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Rif Verification Service running on port ${PORT}`);
});
