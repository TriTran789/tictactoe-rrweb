import { getRecords } from "@/actions/record";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Content() {
	const [records, setRecords] = useState<any[]>([]);
  useEffect(() => {
    getRecords().then((r) => {
      setRecords(r);
    });
  }, []);

	return (
		<div className="w-full grid grid-cols-4 gap-20">
			{records.map((record, index) => (
				<>
					<Link
						href={`/history/${record._id}`}
						className="h-44 border rounded-3xl flex justify-center items-center shadow shadow-white hover:cursor-pointer hover:bg-white/5"
					>
						<span className="text-2xl font-bold">{`Record ${
							index + 1
						}`}</span>
					</Link>
				</>
			))}
		</div>
	);
}
