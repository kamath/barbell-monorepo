export const logEvent = async (event: Event) => {
	await prisma.event.create({
		data: {
			name: event.name,
			metadata: event.metadata
		}
	})
}