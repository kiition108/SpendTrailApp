// src/utils/transactionFormatter.js

export const formatRelativeDate = (ts) => {
  const date = new Date(ts);
  const now = new Date();
  const diffInMs = now - date;
  const dayDiff = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  const timeString = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (dayDiff === 0) return `Today • ${timeString}`;
  if (dayDiff === 1) return `Yesterday • ${timeString}`;
  if (dayDiff < 7) {
    const weekday = date.toLocaleDateString('en-IN', { weekday: 'short' });
    return `${weekday} • ${timeString}`;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const getCategoryIcon = (category) => {
  if (!category) return 'cash-outline';

  const key = category.toLowerCase();
  const icons = {
    food: 'fast-food-outline',
    transport: 'car-outline',
    groceries: 'cart-outline',
    shopping: 'pricetags-outline',
    health: 'medkit-outline',
    travel: 'airplane-outline',
    entertainment: 'film-outline',
    bills: 'document-text-outline',
    income: 'trending-up-outline',
    salary: 'wallet-outline',
  };

  return icons[key] || 'cash-outline';
};

export const formatTransactionList = (transactions) => {
  return transactions
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
    .map((txn) => ({
      id: txn._id,
      merchant: txn.merchant || 'Unknown',
      category: txn.category,
      date: formatRelativeDate(txn.timestamp),
      timestamp: txn.timestamp, // Preserve original timestamp
      amount: txn.source === 'income' ? txn.amount : -Math.abs(txn.amount),
      icon: getCategoryIcon(txn.category),
      location: txn.location,
    }));
};
export const formatFullTransactionList = (transactions) => {
  return transactions
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map((txn) => ({
      id: txn._id,
      merchant: txn.merchant || 'Unknown',
      category: txn.category,
      date: formatRelativeDate(txn.timestamp),
      timestamp: txn.timestamp, // Preserve original timestamp
      amount: txn.source === 'income' ? txn.amount : -Math.abs(txn.amount),
      icon: getCategoryIcon(txn.category),
      location: txn.location
    }));
};