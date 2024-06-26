"use server"

import { createClient } from "@supabase/supabase-js";

export type Booking = {
	id: string;
	createdAt: string;
	updatedAt: string;
	startDate: string;
	endDate: string;
	conferenceRoomId: string;
}

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || "";
const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL || "";

const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_API_KEY);

export async function getBooking(CONFERENCE_ROOM: string): Promise<Booking | null> {
	const { data: conferenceRoom, error: conferenceRoomError } = await supabase.from("ConferenceRoom").select("*").eq('name', CONFERENCE_ROOM);
	const { data: bookings, error: bookingsError } = await supabase
		.from("Booking")
		.select("*")
		.eq('conferenceRoomId', conferenceRoom?.[0]?.id)
		.gte('endDate', new Date().toISOString().split('T')[0]) // Ensure endDate is greater than the current date
		.order('startDate', { ascending: true }); // Order by endDate in ascending order

	console.log(conferenceRoom, bookings);
	return bookings[0];
}