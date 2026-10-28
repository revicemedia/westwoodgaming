// Kategorien des anonymen Feedbacks; Formular und Server Action nutzen dieselbe Liste
export const feedbackCategories = ['Lob', 'Kritik', 'Idee', 'Problem', 'Sonstiges'] as const

export type FeedbackCategory = (typeof feedbackCategories)[number]

// Farbe des Discord-Embeds je Kategorie (Markenfarben, Kritik/Problem in Rot)
export const feedbackColors: Record<FeedbackCategory, number> = {
  Lob: 0xc6ff34,
  Kritik: 0xdc2626,
  Idee: 0x7f3aef,
  Problem: 0xdc2626,
  Sonstiges: 0x6b7280,
}

export const isFeedbackCategory = (value: string): value is FeedbackCategory =>
  (feedbackCategories as readonly string[]).includes(value)
