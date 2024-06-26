"use client"

import { Booking, getBooking } from "@/utils/getBooking";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
	const searchParams = useSearchParams();
	const [bookingData, setBookingData] = useState<Booking | null>(null);

	const CONFERENCE_ROOM = searchParams.get('room') || 'Conference Room 1';

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
			<Suspense fallback={<div>Loading...</div>}>
				<main className="flex h-screen items-center justify-center bg-red-100">
					<div className="flex flex-col items-center justify-center">
						<h1 className="text-4xl font-bold">{CONFERENCE_ROOM}</h1>
						<p className="text-xl">Booked from {formatHumanReadableDate(bookingData.startDate)} to {formatHumanReadableDate(bookingData.endDate)}</p>
					</div>
				</main>
			</Suspense>
		);
	}

	// Start date is in the future
	if (bookingData && new Date(bookingData.startDate) > new Date()) {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<main className="flex h-screen items-center justify-center bg-green-100">
					<div className="flex flex-col items-center justify-center">
						<h1 className="text-4xl font-bold">{CONFERENCE_ROOM}</h1>
						<p className="text-xl">Next booking starts at {formatHumanReadableDate(bookingData.startDate)}</p>
					</div>
				</main>
			</Suspense>
		);
	}
	return <Suspense fallback={<div>Loading...</div>}>
		<main className="flex h-screen items-center justify-center bg-green-100">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-4xl font-bold">{CONFERENCE_ROOM}</h1>
				<p className="text-xl">No bookings!</p>
			</div>
		</main>
	</Suspense>;
}
