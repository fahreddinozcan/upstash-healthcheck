import {
  Line,
  LineChart,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";

type PingObject = {
  time: string;
  ping: number;
};

export function Chart({ data }: { data: PingObject[] }) {
  return (
    <div className="mt-4">
      <LineChart
        width={730}
        height={250}
        data={data}
        margin={{ top: 0, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="ping" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
