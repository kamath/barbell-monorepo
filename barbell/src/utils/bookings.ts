import { prisma } from "./prisma";
import type { ConferenceRoom } from "@prisma/client";

export async function getAvailableRooms(date: Date, startTime: string, endTime: string): Promise<ConferenceRoom[]> {
	const parsedDate = new Date(date);
	const parsedStartTime = new Date(`${parsedDate.toISOString().split('T')[0]}T${startTime}:00`);
	const parsedEndTime = new Date(`${parsedDate.toISOString().split('T')[0]}T${endTime}:00`);

	return prisma.conferenceRoom.findMany({
		where: {
			bookings: {
				none: {
					OR: [
						{
							startDate: {
								lt: parsedEndTime
							},
							endDate: {
								gt: parsedStartTime
							}
						}
					]
				}
			}
		}
	});
}

export async function bookRoom(roomId: string, date: Date, startTime: string, endTime: string): Promise<void> {
	const parsedDate = new Date(date);
	const parsedStartTime = new Date(`${parsedDate.toISOString().split('T')[0]}T${startTime}:00`);
	const parsedEndTime = new Date(`${parsedDate.toISOString().split('T')[0]}T${endTime}:00`);

	await prisma.conferenceRoom.update({
		where: { id: roomId },
		data: {
			bookings: { create: { startDate: parsedStartTime, endDate: parsedEndTime } }
		}
	});
}