import Image from "next/image";

export default function Home() {
	return (
		<main className="flex items-center justify-center h-screen p-8 overflow-x-hidden">
			<div>
				<div className="h-64 z-[-1] flex place-items-center bg-gradient-radial from-blue-700/80 via-blue-700/10 to-transparent w-full">
					<div className="items-center justify-center flex items-center justify-center w-full">
						<Image
							className="drop-shadow-[0_0_0.1rem_#ffffff70]"
							src="/img/barbell.svg"
							alt="Next.js Logo"
							width={500}
							height={0}
							priority
						/>
					</div>
				</div>
				<div className="w-full flex flex-col gap-4">
					<h1 className="text-4xl md:text-8xl font-bold w-full left-0 text-center">Barbell cURLs</h1>
					<h3 className="text-lg md:text-3xl w-full left-0 text-center">Email <a href="mailto:anirudh@kamath.io" className="underline">anirudh@kamath.io</a> to get started.</h3>
				</div>
			</div>
		</main>
	);
}
