'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

export default function SearchFilters() {
    const [showAdvanced, setShowAdvanced] = useState(false)

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by location or venue name..."
                        className="pl-10 h-12 transition-all duration-200 focus:scale-[1.01]"
                    />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-full md:w-48 h-12">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="wedding">Weddings</SelectItem>
                        <SelectItem value="festival">Festivals</SelectItem>
                        <SelectItem value="kids-party">Kids Parties</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="h-12 transition-all duration-200"
                >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                </Button>
                <Button
                    size="lg"
                    className="h-12 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-200"
                >
                    Search
                </Button>
            </div>
            {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg border animate-fade-in-up">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Max Guests</label>
                        <Input type="number" placeholder="e.g., 100" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Max Price</label>
                        <Input type="number" placeholder="e.g., 5000" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Min Rating</label>
                        <Select defaultValue="0">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Any</SelectItem>
                                <SelectItem value="3">3+ Stars</SelectItem>
                                <SelectItem value="4">4+ Stars</SelectItem>
                                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}
