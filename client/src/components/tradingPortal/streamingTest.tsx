import { useEffect, useState } from "react";

interface KlineData {
    Id: number;
    Close: number;
    Open: number;
    High: number;
    Low: number;
    Volume: number;
}

interface ForexData {
    code: number;
    data: KlineData[];
}

function ForexLiveData() {
    const [data, setData] = useState<ForexData | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3000/ws");

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            const newData = JSON.parse(event.data);
            setData(newData);
            // console.log("Received new data:", newData);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => console.log("WebSocket disconnected");

        return () => ws.close();
    }, []);

    return (
        <div>
            <h2>Live Forex Updates</h2>
            {data && data.data && data.data.length > 0 && (
                <div>
                    <h3>Latest Price Data:</h3>
                    <p>Close: {data.data[0].Close}</p>
                    <p>Open: {data.data[0].Open}</p>
                    <p>High: {data.data[0].High}</p>
                    <p>Low: {data.data[0].Low}</p>
                    <p>Volume: {data.data[0].Volume}</p>
                    <p>Timestamp: {new Date(data.data[0].Id).toLocaleTimeString()}</p>
                </div>
            )}
        </div>
    );
}

export default ForexLiveData;
