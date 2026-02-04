import { forwardRef } from "react";
import { cn } from "@red-salud/core/utils";

export interface VisualRecipeData {
    patientName?: string;
    patientAge?: string;
    patientWeight?: string;
    patientSex?: string;
    patientId?: string; // Folio/Cedula
    diagnosis?: string;
    medications?: Array<{
        name: string;
        genericName?: string; // (dcsdc)
        presentation?: string;
        frequency?: string;
        duration?: string;
        route?: string;
        specialInstructions?: string;
    }>;
    date?: string;
    doctorName?: string;
    doctorSpecialty?: string;
    doctorTitle?: string;
    doctorProfessionalId?: string; // Cedula
    clinicName?: string;
    clinicAddress?: string;
    clinicPhone?: string;
    clinicEmail?: string;
}

export interface VisualRecipeSettings {
    templateId: string;
    frameColor: string;
    watermarkUrl?: string | null;
    logoUrl?: string | null;
    signatureUrl?: string | null;
    showLogo: boolean;
    showSignature: boolean;
}

interface VisualRecipePreviewProps {
    data: VisualRecipeData;
    settings: VisualRecipeSettings;
    className?: string;
}

export const VisualRecipePreview = forwardRef<HTMLDivElement, VisualRecipePreviewProps>(
    ({ data, settings, className }, ref) => {
        const {
            templateId,
            frameColor = "#0da9f7",
            watermarkUrl,
            logoUrl,
            signatureUrl,
            showLogo,
            showSignature
        } = settings;

        // Default or "Plantilla 3 / Modern" structure based on user prompt
        // This structure uses absolute positioning for a print-perfect layout
        return (
            <div
                ref={ref}
                className={cn(
                    "relative bg-white text-black overflow-hidden shadow-lg mx-auto transition-transform duration-100",
                    className
                )}
                style={{
                    width: "816px", // approx A4 width at 96dpi ? Or just a standard scale
                    height: "1056px",
                    fontFamily: "Manrope, sans-serif",
                    // Scale down for preview if needed by parent container transform
                }}
            >
                {/* Background Frame */}
                {/* Note: The user provided a background image URL in their snippet. 
                    We should try to use the template logic to pick the right frame image or border. 
                    For now, using the user's snippet logic: frame image + watermark.
                */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                    style={{
                        // If templateId maps to a specific frame image, use it. 
                        // Otherwise, we might just use a border if it's "Simple".
                        // The user snippet used a specific URL. We'll try to replicate that structure.
                        backgroundImage: (() => {
                            switch (templateId) {
                                case 'plantilla-3':
                                    return `url('https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_frames/pc%203%20copia%202.png')`;
                                case 'media-pagina-1':
                                    return `url('https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_frames/osea%20si%20pero%20arriba%20copia.png')`;
                                case 'plantilla-1':
                                    return `url('https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets//generic_frames/1754768140717_pc_1_juajau.png')`;
                                case 'plantilla-2':
                                    return `url('https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets//generic_frames/1754766102442_copipoadjsoidh.png')`;
                                default:
                                    return 'none';
                            }
                        })(),
                        border: templateId === 'template-1' || templateId === 'simple' ? `4px solid ${frameColor}` : 'none',
                        opacity: 1, // Backgrounds are usually full opacity frames
                        mixBlendMode: 'multiply', // Ensure text shows through if it overlaps, though z-index handles it
                        filter: "hue-rotate(0deg)",
                    }}
                />

                {/* Watermark */}
                {watermarkUrl && (
                    <div
                        className="absolute inset-0 bg-no-repeat bg-center z-0"
                        style={{
                            backgroundImage: `url('${watermarkUrl}')`,
                            backgroundSize: "50%",
                            opacity: 0.1,
                        }}
                    />
                )}

                {/* Content Container */}
                <div className="relative h-full pb-[150px] z-10">

                    {/* Header: Logo & Doctor Info */}

                    {/* Logo (Top Left) */}
                    {showLogo && logoUrl && (
                        <div style={{ top: "25px", left: "60px", width: "165px", height: "93px", position: "absolute" }}>
                            <img
                                src={logoUrl}
                                alt="logo"
                                style={{ height: "100%", width: "100%", objectFit: "contain" }}
                            />
                        </div>
                    )}

                    {/* Doctor Info (Top Right) */}
                    <div style={{ top: "25px", right: "60px", fontSize: "22px", position: "absolute", textAlign: "right" }}>
                        <strong style={{ color: frameColor }}>{data.doctorTitle || "Dr."} {data.doctorName}</strong>
                    </div>
                    <div style={{ top: "52px", color: "#555", right: "60px", fontSize: "14px", position: "absolute", textAlign: "right" }}>
                        {data.doctorSpecialty}
                    </div>
                    <div style={{ top: "70px", color: "#555", right: "60px", fontSize: "14px", position: "absolute", textAlign: "right", lineHeight: "1.4" }}>
                        {data.clinicAddress ? `${data.clinicAddress} • ` : ""}
                        <b className="ml-1">Céd. Prof. </b>{data.doctorProfessionalId}
                    </div>

                    {/* Patient Info Bar */}
                    <div style={{
                        gap: "5px 20px",
                        top: "150px",
                        left: "52.5px",
                        right: "52.5px",
                        display: "grid",
                        fontSize: "14px",
                        position: "absolute",
                        alignItems: "flex-start",
                        lineHeight: "1.6",
                        gridTemplateColumns: "1.5fr 1fr"
                    }}>
                        <div style={{ gridColumn: "1 / 3" }}>
                            <strong style={{ color: frameColor }}>Paciente:</strong> {data.patientName || "Sin paciente"}
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <strong style={{ color: frameColor }}>Edad:</strong> {data.patientAge || "--"} &nbsp;
                            <strong style={{ color: frameColor }}>Peso:</strong> {data.patientWeight || "--"} &nbsp;
                            <strong style={{ color: frameColor }}>Sexo:</strong> {data.patientSex || "--"}
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <strong style={{ color: frameColor }}>Folio:</strong> {data.patientId || "RX-1"} &nbsp;
                            <strong style={{ color: frameColor }}>Fecha:</strong> {data.date || new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {/* Rx Symbol */}
                    <div style={{ top: "230px", left: "60px", fontSize: "16px", position: "absolute" }}>
                        <strong style={{ color: frameColor }}>Rx.</strong>
                    </div>

                    {/* Medications List */}
                    <div style={{ gap: "15px", top: "260px", left: "60px", right: "60px", display: "flex", position: "absolute", flexDirection: "column" }}>
                        {data.medications && data.medications.length > 0 ? (
                            data.medications.map((med, idx) => (
                                <div key={idx} style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                                        <strong style={{ color: frameColor }}>{idx + 1}. {med.name}</strong>
                                        {med.genericName && ` (${med.genericName})`}
                                        {med.specialInstructions && ` - ${med.specialInstructions}`}
                                    </div>
                                    <div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontSize: "13px", color: "#555", paddingLeft: "20px" }}>
                                            {med.presentation && <span>Presentación: {med.presentation}</span>}
                                            {med.frequency && <span>Frecuencia: {med.frequency}</span>}
                                            {med.duration && <span>Duración: {med.duration}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 italic text-sm p-4 text-center">
                                Sin medicamentos prescritos
                            </div>
                        )}

                        {/* Diagnosis if distinct */}
                        {data.diagnosis && (
                            <div className="mt-4 pt-4 border-t">
                                <strong style={{ color: frameColor, fontSize: "14px" }}>Diagnóstico:</strong>
                                <span className="text-sm ml-2 text-gray-700">{data.diagnosis}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer / Signature Area */}
                    <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", height: "150px" }}>
                        {/* Signature Image */}
                        {showSignature && signatureUrl && (
                            <div style={{ left: "50%", width: "180px", bottom: "122px", height: "70px", position: "absolute", transform: "translateX(-50%)" }}>
                                <img
                                    src={signatureUrl}
                                    alt="signature"
                                    style={{ height: "100%", width: "100%", objectFit: "contain" }}
                                />
                            </div>
                        )}

                        {/* Signature Line */}
                        <div style={{ left: "calc(50% - 125px)", width: "250px", bottom: "117px", height: "1px", position: "absolute", backgroundColor: "#383838" }}></div>

                        {/* Doctor Name Footer */}
                        <div style={{ left: "50%", bottom: "97px", fontSize: "14px", position: "absolute", textAlign: "center", transform: "translateX(-50%)" }}>
                            <strong style={{ color: frameColor }}>{data.doctorTitle || "Dr."} {data.doctorName}</strong>
                        </div>

                        {/* Doctor Details Footer (University/Title) */}
                        <div style={{ left: "60px", color: "#555", right: "60px", bottom: "47px", fontSize: "13px", position: "absolute", textAlign: "center" }}>
                            <strong style={{ color: frameColor }}>{data.clinicName}</strong> • {data.clinicEmail}
                        </div>

                        {/* Contact Icons / Address */}
                        <div style={{ left: "60px", right: "60px", bottom: "17px", fontSize: "13px", position: "absolute", textAlign: "center" }}>
                            <div style={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
                                {data.clinicPhone && (
                                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        📞 {data.clinicPhone}
                                    </span>
                                )}
                                {data.clinicAddress && (
                                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        📍 {data.clinicAddress}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

VisualRecipePreview.displayName = "VisualRecipePreview";
