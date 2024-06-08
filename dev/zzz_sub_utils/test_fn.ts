import { io } from "@interval/sdk";
import { v4 as uuidv4 } from 'uuid';

export function createUser(email: string, startDate: Date): { email: string, startDate: Date, id: string } {
    const id = uuidv4();
    return { email, startDate, id };
}

export function getCharges(email: string): { email: string, startDate: Date, id: string }[] {
    return [];
}


export function refundCharge(chargeId: string): void {
    console.log("Refunding charge", chargeId);
}

