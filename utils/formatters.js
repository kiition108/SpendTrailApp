// Utility functions for formatting values

/**
 * Format transaction amount for display
 * Positive amounts (expenses) show with - sign
 * Negative amounts (income) show with + sign
 */
export const formatAmount = (amount) => {
    const sign = amount < 0 ? '+' : '-';
    const absoluteAmount = Math.abs(amount);
    return `${sign}₹${absoluteAmount}`;
};

/**
 * Format amount with color based on type
 * Returns object with formatted text and color
 */
export const formatAmountWithColor = (amount) => {
    return {
        text: formatAmount(amount),
        color: amount < 0 ? '#43C6AC' : '#FF6B6B', // Green for income, Red for expense
    };
};

/**
 * Get transaction type from amount
 */
export const getTransactionType = (amount) => {
    return amount < 0 ? 'income' : 'expense';
};
