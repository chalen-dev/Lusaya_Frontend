import { NumericKeypad } from './NumericKeypad';

interface PaymentSectionProps {
    totalAmount: number;
    tenderedAmount: number;
    onTenderedChange: (value: number) => void;
    change: number;
    isProcessing: boolean;
    cartEmpty: boolean;
    onCheckout: () => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
                                                                  totalAmount,
                                                                  tenderedAmount,
                                                                  onTenderedChange,
                                                                  change,
                                                                  isProcessing,
                                                                  cartEmpty,
                                                                  onCheckout,
                                                              }) => {
    const handleKeypadPress = (key: string) => {
        if (key === '⌫') {
            // Backspace: remove last digit
            const newValue = Math.floor(tenderedAmount / 10);
            onTenderedChange(newValue);
        } else if (key === 'C') {
            // Clear
            onTenderedChange(0);
        } else if (key === '00') {
            // Add two zeros (multiply by 100)
            const newValue = tenderedAmount * 100;
            onTenderedChange(newValue);
        } else if (key === '.') {
            // Ignore decimal for simplicity; could implement later
            return;
        } else {
            // Digit: append to current number
            const digit = parseInt(key, 10);
            const newValue = tenderedAmount * 10 + digit;
            onTenderedChange(newValue);
        }
    };

    const insufficient = tenderedAmount < totalAmount;

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-3">
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span>₱{totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="tendered" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount Tendered
                </label>
                <input
                    type="number"
                    id="tendered"
                    min={0}
                    step="0.01"
                    value={tenderedAmount}
                    onChange={(e) => onTenderedChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Enter amount"
                />
            </div>

            <NumericKeypad onKeyPress={handleKeypadPress} disabled={isProcessing} />

            <div className="flex justify-between text-md text-gray-700 dark:text-gray-300">
                <span>Change:</span>
                <span className={`font-semibold ${change > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    ₱{change.toFixed(2)}
                </span>
            </div>

            <button
                onClick={onCheckout}
                disabled={isProcessing || cartEmpty || insufficient}
                className="w-full mt-2 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
            >
                {isProcessing ? 'Processing...' : 'Checkout'}
            </button>
        </div>
    );
};