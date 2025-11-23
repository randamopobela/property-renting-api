export interface CreateBookingRequest {
    roomId: string;
    checkIn: string | Date;
    checkOut: string | Date;
    guests: number;
}
