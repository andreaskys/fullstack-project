'use client'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Upload, X, ImageIcon, Plus} from 'lucide-react'
import {useState} from 'react'
import Image from 'next/image'
import {AmenityDTO} from "../../types";

interface ListingFormProps {
    initialData?: {
        name: string
        description: string
        price: number
        maxGuests: number
        location: string
        category: string
        coverImage?: string
        amenities: string[]
    },
    onSubmit: (data: any) => void,
    submitLabel?: string,
    amenities?: AmenityDTO[]
}

export function ListingForm({initialData, onSubmit, submitLabel = 'Create Listing', amenities}: ListingFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        maxGuests: initialData?.maxGuests || 0,
        location: initialData?.location || '',
        category: initialData?.category || 'wedding',
        coverImage: initialData?.coverImage || '',
        amenities: initialData?.amenities || [],
    })

    const [newAmenity, setNewAmenity] = useState('')
    const [previewImage, setPreviewImage] = useState<string | null>(initialData?.coverImage || null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result as string)
                setFormData({...formData, coverImage: reader.result as string})
            }
            reader.readAsDataURL(file)
        }
    }

    const addAmenity = () => {
        if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
            setFormData({
                ...formData,
                amenities: [...formData.amenities, newAmenity.trim()]
            })
            setNewAmenity('')
        }
    }

    const removeAmenity = (amenity: string) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.filter(a => a !== amenity)
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 animate-fade-in-up">
                <CardHeader>
                    <CardTitle>Cover Image</CardTitle>
                    <CardDescription>Upload a stunning photo of your venue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {previewImage ? (
                            <div
                                className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 group">
                                <Image
                                    src={previewImage || "/placeholder.svg"}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setPreviewImage(null)
                                            setFormData({...formData, coverImage: ''})
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2"/>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <label
                                className="flex flex-col items-center justify-center aspect-video w-full rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all cursor-pointer bg-muted/10 hover:bg-muted/20">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="h-10 w-10"/>
                                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                                    <span className="text-xs">PNG, JPG up to 10MB</span>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 animate-fade-in-up delay-100">
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Tell us about your venue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Venue Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Elegant Garden Pavilion"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            className="transition-all duration-200 focus:scale-[1.01]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your venue, its features, and what makes it special..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                            rows={5}
                            className="transition-all duration-200 focus:scale-[1.01] resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({...formData, category: value})}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wedding">Wedding</SelectItem>
                                    <SelectItem value="festival">Festival</SelectItem>
                                    <SelectItem value="kids-party">Kids Party</SelectItem>
                                    <SelectItem value="corporate">Corporate</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g., Beverly Hills, CA"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                required
                                className="transition-all duration-200 focus:scale-[1.01]"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pricing & Capacity */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 animate-fade-in-up delay-200">
                <CardHeader>
                    <CardTitle>Pricing & Capacity</CardTitle>
                    <CardDescription>Set your pricing and guest capacity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price per Event ($)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                placeholder="e.g., 3500"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                required
                                className="transition-all duration-200 focus:scale-[1.01]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxGuests">Maximum Guests</Label>
                            <Input
                                id="maxGuests"
                                type="number"
                                min="1"
                                placeholder="e.g., 150"
                                value={formData.maxGuests || ''}
                                onChange={(e) => setFormData({...formData, maxGuests: Number(e.target.value)})}
                                required
                                className="transition-all duration-200 focus:scale-[1.01]"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 animate-fade-in-up delay-300">
                <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                    <CardDescription>What does your venue offer?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., Parking, WiFi, Catering"
                            value={newAmenity}
                            onChange={(e) => setNewAmenity(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                            className="transition-all duration-200 focus:scale-[1.01]"
                        />
                        <Button
                            type="button"
                            onClick={addAmenity}
                            variant="outline"
                            size="icon"
                        >
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </div>

                    {formData.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.amenities.map((amenity) => (
                                <div
                                    key={amenity}
                                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm animate-scale-in"
                                >
                                    <span>{amenity}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAmenity(amenity)}
                                        className="hover:text-destructive transition-colors"
                                    >
                                        <X className="h-3 w-3"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end animate-fade-in-up delay-400">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => window.history.back()}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    {submitLabel}
                </Button>
            </div>
        </form>
    )
}