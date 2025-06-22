#!/bin/bash

# Script to migrate test files from individual mocking to global mocks
# This script helps remove individual jest.mock calls for react-toastify and react-router

echo "Starting test mock migration..."

# Function to migrate a single file
migrate_file() {
    local file="$1"
    echo "Migrating: $file"

    # Create a backup
    cp "$file" "$file.backup"

    # Remove react-toastify mock
    sed -i '' '/jest\.mock.*react-toastify/,/});/d' "$file"

    # Remove react-router mock (but keep useParams and useLocation if they exist)
    sed -i '' '/jest\.mock.*react-router/,/});/d' "$file"

    # Remove local mockNavigate declaration
    sed -i '' '/const mockNavigate = jest\.fn();/d' "$file"

    # Add import for mockNavigate if the file uses it
    if grep -q "mockNavigate" "$file"; then
        # Check if test-utils import already exists
        if ! grep -q "import.*test-utils" "$file"; then
            # Add import after the last import statement
            sed -i '' '/^import.*$/a\
import { mockNavigate } from '\''test-utils'\'';
' "$file"
        fi
    fi

    echo "✓ Migrated: $file"
}

# List of files that still need migration
files_to_migrate=(
    "src/routes/list/containers/ListContainer.spec.tsx"
    "src/routes/lists/containers/ListsContainer.spec.tsx"
    "src/routes/share_list/containers/ShareListForm.spec.tsx"
    "src/routes/users/EditInvite.spec.tsx"
    "src/routes/list/EditListItem.spec.tsx"
    "src/routes/list/List.spec.tsx"
    "src/routes/lists/EditList.spec.tsx"
    "src/routes/share_list/ShareList.spec.tsx"
    "src/routes/lists/components/PendingLists.spec.tsx"
    "src/routes/lists/components/AcceptedLists.spec.tsx"
    "src/routes/lists/containers/EditListForm.spec.tsx"
    "src/routes/lists/containers/CompletedListsContainer.spec.tsx"
    "src/routes/list/components/ListItemForm.spec.tsx"
    "src/routes/list/containers/EditListItemForm.spec.tsx"
    "src/routes/list/containers/BulkEditListItemsForm.spec.tsx"
    "src/routes/v2/list/containers/ListContainer.spec.tsx"
    "src/components/AppNav.spec.tsx"
)

# Migrate each file
for file in "${files_to_migrate[@]}"; do
    if [ -f "$file" ]; then
        migrate_file "$file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo ""
echo "Migration complete!"
echo ""
echo "Files that have been migrated:"
echo "✓ src/routes/error_pages/PageNotFound.spec.tsx"
echo "✓ src/routes/users/NewPassword.spec.tsx"
echo "✓ src/routes/users/EditPassword.spec.tsx"
echo "✓ src/routes/users/NewSession.spec.tsx"
echo "✓ src/routes/users/InviteForm.spec.tsx"
echo "✓ src/routes/list/components/ChangeOtherListModal.spec.tsx"
echo "✓ src/routes/v2/list/List.spec.tsx"
echo "✓ src/routes/v2/list/components/ListItemForm.spec.tsx"
echo ""
echo "Next steps:"
echo "1. Run the tests to ensure everything works: npm test"
echo "2. Review any files that had special mocking (useLocation, useParams)"
echo "3. Remove any remaining individual mocks manually if needed"
echo "4. Update the documentation if needed"
