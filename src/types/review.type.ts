export interface CreateReviewRequest {
  bookingId: string;
  comment: string; 
}

export interface ReplyReviewRequest {
  reply: string;
}