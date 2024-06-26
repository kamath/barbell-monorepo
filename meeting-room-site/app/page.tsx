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

function DisplayBooking() {
	const searchParams = useSearchParams();
	const CONFERENCE_ROOM = searchParams.get('room') || 'Conference Room 1';
	const [bookingData, setBookingData] = useState<Booking | null>(null);

	useEffect(() => {
		const fetchBookings = async () => {
			const data = await getBooking(CONFERENCE_ROOM);
			if (data) {
				setBookingData(data);
			}
		};
		fetchBookings();

		const intervalId = setInterval(fetchBookings, 10000);
		return () => clearInterval(intervalId);
	}, []);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setBookingData((prevData) => {
				if (!prevData) return prevData;
				return { ...prevData };
			});
		}, 1000);
		return () => clearInterval(intervalId);
	}, []);

	// Start date is in the past and end date is in the future
	if (bookingData && new Date(bookingData.startDate) < new Date() && new Date(bookingData.endDate) > new Date()) {
		const timeRemaining = new Date(bookingData.endDate).getTime() - new Date().getTime();
		const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
		const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

		return (
			<main className="flex h-screen items-center justify-center bg-red-100">
				<div className="flex flex-col items-center justify-center gap-8">
					<p className="text-8xl text-center font-bold">{hours}h {minutes}m {seconds}s</p>
					<h1 className="text-5xl">{CONFERENCE_ROOM}</h1>
					<p className="text-4xl">Booked until: <span className="font-bold">{formatHumanReadableDate(bookingData.endDate)}</span></p>
				</div>
			</main>
		);
	}

	// Start date is in the future
	if (bookingData && new Date(bookingData.startDate) > new Date()) {
		const timeRemaining = new Date(bookingData.startDate).getTime() - new Date().getTime();
		const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
		const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

		return (
			<main className="flex h-screen items-center justify-center bg-green-100">
				<div className="flex flex-col items-center justify-center gap-8">
					<p className="text-8xl text-center font-bold">{hours}h {minutes}m {seconds}s</p>
					<h1 className="text-5xl">{CONFERENCE_ROOM}</h1>
					<p className="text-4xl">Next booking: <span className="font-bold">{formatHumanReadableDate(bookingData.startDate)}</span></p>
				</div>
			</main>
		);
	}
	return (
		<main className="flex h-screen items-center justify-center bg-green-100">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-4xl font-bold">{CONFERENCE_ROOM}</h1>
				<p className="text-xl">No bookings!</p>
			</div>
		</main>
	)
}

export default function Home() {
	return <Suspense fallback={<div>Loading...</div>}>
		<DisplayBooking />
	</Suspense>;
}
