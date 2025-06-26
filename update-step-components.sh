#!/bin/bash

# Script to help update step components with the new design system
# This will show all the card styles that need to be updated

echo "🎨 Finding all Card components in step files..."
echo "================================================"

# Find all Card className patterns in step components
for file in src/components/steps/*.tsx; do
    echo ""
    echo "📄 File: $file"
    echo "-------------------"
    
    # Find Card components with their className
    grep -n "Card className=" "$file" || echo "  No Card components found"
    
    # Find CardHeader components
    grep -n "CardHeader className=" "$file" || echo "  No CardHeader styles"
    
    # Find shadow- patterns
    echo ""
    echo "  Shadow classes:"
    grep -o "shadow-[a-z0-9]*" "$file" | sort | uniq || echo "    None found"
    
    # Find rounded- patterns
    echo ""
    echo "  Rounded classes:"
    grep -o "rounded-[a-z0-9]*" "$file" | sort | uniq || echo "    None found"
    
    # Find border patterns
    echo ""
    echo "  Border classes:"
    grep -o "border-[a-z0-9/-]*" "$file" | sort | uniq || echo "    None found"
done

echo ""
echo "================================================"
echo "✅ Analysis complete!"
echo ""
echo "To update these components:"
echo "1. Import the design system: import { designSystem, cn } from '@/lib/design-system'"
echo "2. Replace Card className with: className={designSystem.card.container}"
echo "3. Replace CardHeader className with: className={designSystem.card.header}"
echo "4. Replace CardTitle className with: className={designSystem.card.title}"
echo "5. Replace CardDescription className with: className={designSystem.card.description}"
echo "6. Replace CardContent className with: className={designSystem.card.content}"