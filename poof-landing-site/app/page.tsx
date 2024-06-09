import 'animate.css'
import Image from 'next/image';

export default function Home() {
	const firstMsg = "Backchanneling into your Slack channels";

	return (
		<main className="flex flex-col justify-center h-screen px-8 bg-gradient-to-br from-gray-800 to-black">
			<Image
				className="animate__animated animate__fadeIn drop-shadow-[0_0_0.1rem_#ffffff70]"
				src="/img/barbell.svg"
				alt="Barbell cURLs"
				width={500}
				height={0}
				priority
			/>
			<h1 className="animate__animated animate__fadeIn text-7xl md:text-8xl font-bold xs:text-4xl text-transparent bg-clip-text bg-gradient-to-t from-[#cfd9df] to-[#e2ebf0]" style={{
				animationDelay: "0.5s"
			}}>Barbell cURLs</h1>
			<h3 className='animate__animated animate__fadeIn text-white text-2xl font-bold mt-8'>{firstMsg.split(" ").map((x, i) => {
				return <span key={x} className={`animate__animated animate__fadeIn`} style={{
					animationDelay: `${i * 0.1 + 1}s`
				}}>{x} </span>
			})}</h3>
		</main>
	);
}
