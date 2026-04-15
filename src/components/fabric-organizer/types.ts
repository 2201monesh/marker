export interface Representative {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Note {
  id: string;
  text: string;
  author: string;
  date: string;
  type: "extracted" | "manual";
}

export interface EmailThread {
  id: string;
  subject: string;
  messageCount: number;
  participants: string[];
  dateRange: string;
  preview: string;
}

export interface Mill {
  id: string;
  name: string;
  location: string;
  lastActive: string;
  representatives: Representative[];
  notes: Note[];
  emailThreads: EmailThread[];
}

export interface Fabric {
  id: string;
  millId: string;
  artNumber: string;
  name: string;
  composition: string;
  weight: string;
  price: string;
  moq: string;
  moc: string;
  paymentTerms: string;
  contactEmail: string;
}

export type View =
  | { page: "search" }
  | { page: "mills" }
  | { page: "mill-detail"; millId: string };
