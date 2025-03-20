const OpenPosition = ({
    transactionPairs,
    direction,
    lots,
    price,
    lowerUnitPrice,
    currentPrice,
    handlingFee,
    margin,
    profit,
    openTime,
    closeTime,
}: {
    transactionPairs: string;
    direction: string;
    lots: number;
    price: number;
    lowerUnitPrice: number;
    currentPrice: number;
    handlingFee: number;
    margin: number;
    profit: number;
    openTime: Date;
    closeTime: Date;
}) => {
    return (
        <div>
            <h1>Open Position</h1>
            <p>Transaction Pairs: {transactionPairs}</p>
            <p>Direction: {direction}</p>
            <p>Lots: {lots}</p>
            <p>Price: {price}</p>
            <p>Lower Unit Price: {lowerUnitPrice}</p>
            <p>Current Price: {currentPrice}</p>
            <p>Handling Fee: {handlingFee}</p>
            <p>Margin: {margin}</p>
            <p>Profit: {profit}</p>
            <p>Open Time: {openTime.toLocaleString()}</p>
            <p>Close Time: {closeTime.toLocaleString()}</p>
        </div>
    );
};

export default OpenPosition;


