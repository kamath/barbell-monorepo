"use client"

import { Booking, getBooking } from "@/utils/getBooking";
import { useEffect, useState } from "react";

const CONFERENCE_ROOM = 'Conference Room 1'

function formatHumanReadableDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleString(undefined, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	});
}

export default function Home() {
	const [bookingData, setBookingData] = useState<Booking | null>(null);

	useEffect(() => {
		const fetchBookings = async () => {
			const data = await getBooking(CONFERENCE_ROOM);
			if (data) {
				setBookingData(data);
			}
			setTimeout(fetchBookings, 10000);
		};
		fetchBookings();
	}, []);

	// Start date is in the past and end date is in the future
	if (bookingData && new Date(bookingData.startDate) < new Date() && new Date(bookingData.endDate) > new Date()) {
		return (
			<main className="flex h-screen items-center justify-center bg-red-100">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-4xl font-bold">{CONFERENCE_ROOM}</h1>
					<p className="text-xl">Booked from {formatHumanReadableDate(bookingData.startDate)} to {formatHumanReadableDate(bookingData.endDate)}</p>
				</div>
			</main>
		);
	}

	// Start date is in the future
	if (bookingData && new Date(bookingData.startDate) > new Date()) {
		return (
			<main className="flex h-screen items-center justify-center bg-green-100">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-4xl font-bold">{CONFERENCE_ROOM}</h1>
					<p className="text-xl">Next booking starts at {formatHumanReadableDate(bookingData.startDate)}</p>
				</div>
			</main>
		);
	}
	return null;
}
