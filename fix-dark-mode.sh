#!/bin/bash

# Fix dark mode issues across all files
cd "/Users/mahiiyh/Developer/SQL Query Management Dashboard/frontend/src"

# Fix QueryEditor.tsx
sed -i '' 's/text-gray-700">Public/text-gray-700 dark:text-gray-300">Public/g' pages/QueryEditor.tsx
sed -i '' 's/"text-sm text-gray-700"/"text-sm text-gray-700 dark:text-gray-300"/g' pages/QueryEditor.tsx
sed -i '' 's/border-gray-300 rounded-lg/border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white/g' pages/QueryEditor.tsx

# Fix AdminUsers.tsx
sed -i '' 's/border-gray-300 rounded/border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded/g' pages/AdminUsers.tsx

# Fix Schedules.tsx
find pages -name "*.tsx" -exec sed -i '' 's/bg-white shadow/bg-white dark:bg-gray-800 shadow/g' {} \;
find pages -name "*.tsx" -exec sed -i '' 's/border-gray-200 p-6/border-gray-200 dark:border-gray-700 p-6/g' {} \;
find pages -name "*.tsx" -exec sed -i '' 's/bg-gray-50/bg-gray-50 dark:bg-gray-700\/50/g' {} \;

# Fix all environment badges
find pages -name "*.tsx" -exec sed -i '' 's/bg-red-100 text-red-800/bg-red-100 dark:bg-red-900\/30 text-red-800 dark:text-red-300/g' {} \;
find pages -name "*.tsx" -exec sed -i '' 's/bg-yellow-100 text-yellow-800/bg-yellow-100 dark:bg-yellow-900\/30 text-yellow-800 dark:text-yellow-300/g' {} \;
find pages -name "*.tsx" -exec sed -i '' 's/bg-green-100 text-green-800/bg-green-100 dark:bg-green-900\/30 text-green-800 dark:text-green-300/g' {} \;

echo "Dark mode fixes applied!"
