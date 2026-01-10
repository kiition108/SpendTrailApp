// Centralized category color mapping
// Used across CategoriesScreen and ReportsScreen for consistency

export const categoryColors = {
    Food: '#FF6B6B',
    Transport: '#4ECDC4',
    Shopping: '#FFB84D',
    Entertainment: '#A461D8',
    Bills: '#43C6AC',
    Health: '#FD79A8',
    Other: '#667eea',
    Uncategorized: '#95a5a6'
};

export const getCategoryColor = (categoryName) => {
    return categoryColors[categoryName] || categoryColors.Other;
};
