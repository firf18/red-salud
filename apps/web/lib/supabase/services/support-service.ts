import { supabase } from "../client";

export interface TicketData {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    priority: string;
    message: string;
}

export interface KBSearchResult {
    id: number;
    content: string;
    metadata: {
        title: string;
        url: string;
        category: string;
        keywords: string[];
        readTime?: string;
    };
    category: string;
    similarity: number;
}

export const supportService = {
    /**
     * Creates a new support ticket from the contact form.
     */
    async createTicket(data: TicketData) {
        try {
            const { error } = await supabase
                .from("support_tickets")
                .insert([data]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("Error creating support ticket:", error);
            return { success: false, error };
        }
    },

    /**
     * Performs a semantic search in the knowledge base.
     */
    async searchKnowledgeBase(query: string, threshold = 0.5, count = 5) {
        try {
            // In a real production environment, we would call an edge function 
            // to generate the embedding first, or use a client-side library.
            // For now, since indexing is done via script, we expect a search 
            // functionality to be triggered via an API route that can use Gemini.

            const res = await fetch('/api/soporte/buscar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, threshold, count })
            });

            if (!res.ok) throw new Error("Search failed");

            const data = await res.json();
            return { success: true, data: data.results as KBSearchResult[] };
        } catch (error) {
            console.error("Error searching knowledge base:", error);
            return { success: false, error, data: [] };
        }
    },

    /**
     * Fetches popular/featured articles.
     */
    async getPopularArticles(limit = 6) {
        try {
            const { data, error } = await supabase
                .from("documents")
                .select("id, content, metadata, category")
                .limit(limit);

            if (error) throw error;
            return { success: true, data: (data || []) as KBSearchResult[] };
        } catch (error) {
            console.error("Error fetching popular articles:", error);
            return { success: false, error, data: [] };
        }
    }
};
