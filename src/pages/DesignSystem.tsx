import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, Bell, Check, ChevronRight, Info, Mail, Search, Settings, Star, User } from "lucide-react";

/**
 * Design System documentation page.
 * Displays all design tokens, colors, typography, and component examples.
 */
const DesignSystem = () => {
  const brandPrimaryColors = [
    { name: "50", hex: "#C0C0C0", className: "bg-brand-primary-50" },
    { name: "100", hex: "#AEAEAE", className: "bg-brand-primary-100" },
    { name: "200", hex: "#8B8B8B", className: "bg-brand-primary-200" },
    { name: "300", hex: "#676767", className: "bg-brand-primary-300" },
    { name: "400", hex: "#434343", className: "bg-brand-primary-400" },
    { name: "500", hex: "#1F1F1F", className: "bg-brand-primary-500" },
    { name: "600", hex: "#1A1A1A", className: "bg-brand-primary-600" },
    { name: "700", hex: "#151515", className: "bg-brand-primary-700" },
    { name: "800", hex: "#101010", className: "bg-brand-primary-800" },
    { name: "900", hex: "#0B0B0B", className: "bg-brand-primary-900" },
  ];

  const brandSecondaryColors = [
    { name: "50", hex: "#D4F5E2", className: "bg-brand-secondary-50" },
    { name: "100", hex: "#C7F2D9", className: "bg-brand-secondary-100" },
    { name: "200", hex: "#AEECC8", className: "bg-brand-secondary-200" },
    { name: "300", hex: "#96E7B8", className: "bg-brand-secondary-300" },
    { name: "400", hex: "#7DE1A7", className: "bg-brand-secondary-400" },
    { name: "500", hex: "#64DB96", className: "bg-brand-secondary-500" },
    { name: "600", hex: "#54B87E", className: "bg-brand-secondary-600" },
    { name: "700", hex: "#449566", className: "bg-brand-secondary-700" },
    { name: "800", hex: "#34724E", className: "bg-brand-secondary-800" },
    { name: "900", hex: "#244F36", className: "bg-brand-secondary-900" },
  ];

  const brandTertiaryColors = [
    { name: "50", hex: "#BDD2C6", className: "bg-brand-tertiary-50" },
    { name: "100", hex: "#ABC5B6", className: "bg-brand-tertiary-100" },
    { name: "200", hex: "#85AB95", className: "bg-brand-tertiary-200" },
    { name: "300", hex: "#609275", className: "bg-brand-tertiary-300" },
    { name: "400", hex: "#3A7854", className: "bg-brand-tertiary-400" },
    { name: "500", hex: "#155E34", className: "bg-brand-tertiary-500" },
    { name: "600", hex: "#124F2C", className: "bg-brand-tertiary-600" },
    { name: "700", hex: "#0E4023", className: "bg-brand-tertiary-700" },
    { name: "800", hex: "#0B311B", className: "bg-brand-tertiary-800" },
    { name: "900", hex: "#082213", className: "bg-brand-tertiary-900" },
  ];

  const surfaceColors = [
    { name: "50", hex: "#FAFAFA", className: "bg-surface-50" },
    { name: "100", hex: "#F9F9F9", className: "bg-surface-100" },
    { name: "200", hex: "#F6F6F6", className: "bg-surface-200" },
    { name: "300", hex: "#F3F3F3", className: "bg-surface-300" },
    { name: "400", hex: "#F1F1F1", className: "bg-surface-400" },
    { name: "500", hex: "#EEEEEE", className: "bg-surface-500" },
    { name: "600", hex: "#C8C8C8", className: "bg-surface-600" },
    { name: "700", hex: "#A2A2A2", className: "bg-surface-700" },
    { name: "800", hex: "#7C7C7C", className: "bg-surface-800" },
    { name: "900", hex: "#565656", className: "bg-surface-900" },
  ];

  const semanticColors = [
    { name: "Error", hex: "#F44336", className: "bg-error", textClass: "text-white" },
    { name: "Warning", hex: "#F9A849", className: "bg-warning", textClass: "text-foreground" },
    { name: "Success", hex: "#6CC068", className: "bg-success", textClass: "text-white" },
    { name: "Info", hex: "#79CFDC", className: "bg-info", textClass: "text-foreground" },
  ];

  const typographyExamples = [
    { name: "H1", className: "text-h1 font-heading", example: "Heading 1" },
    { name: "H2", className: "text-h2 font-heading", example: "Heading 2" },
    { name: "H3", className: "text-h3 font-heading", example: "Heading 3" },
    { name: "H4", className: "text-h4 font-heading", example: "Heading 4" },
    { name: "H5", className: "text-h5 font-heading", example: "Heading 5" },
    { name: "H6", className: "text-h6 font-heading", example: "Heading 6" },
    { name: "Subtitle 1", className: "text-subtitle-1", example: "Subtitle text style" },
    { name: "Subtitle 2", className: "text-subtitle-2", example: "Subtitle 2 text style" },
    { name: "Body 1", className: "text-body-1", example: "Body text for main content and paragraphs." },
    { name: "Body 2", className: "text-body-2", example: "Smaller body text for secondary content." },
    { name: "Caption", className: "text-caption", example: "Caption text for labels" },
    { name: "Overline", className: "text-overline uppercase", example: "OVERLINE TEXT" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-h1 font-heading text-foreground">Design System</h1>
            <p className="text-body-1 text-muted-foreground max-w-2xl mx-auto">
              A comprehensive guide to the colors, typography, and components used across the platform.
            </p>
          </div>

          <Separator />

          {/* Typography Section */}
          <section className="space-y-6">
            <h2 className="text-h3 font-heading text-foreground">Typography</h2>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Font Families</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-caption text-muted-foreground uppercase">Headings</span>
                  <span className="font-heading text-h4">Barlow Semi Condensed</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-caption text-muted-foreground uppercase">Body</span>
                  <span className="font-sans text-body-1">Manrope</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Type Scale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {typographyExamples.map((type) => (
                    <div key={type.name} className="flex items-baseline justify-between border-b border-border pb-4 last:border-0">
                      <div className="flex-1">
                        <span className={type.className}>{type.example}</span>
                      </div>
                      <code className="text-caption text-muted-foreground bg-muted px-2 py-1 rounded">
                        {type.className}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Colors Section */}
          <section className="space-y-6">
            <h2 className="text-h3 font-heading text-foreground">Colors</h2>

            {/* Brand Primary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Brand Primary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {brandPrimaryColors.map((color) => (
                    <div key={color.name} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-12 h-12 rounded-lg ${color.className} border border-border`}
                      />
                      <span className="text-caption text-muted-foreground">{color.name}</span>
                      <span className="text-overline text-muted-foreground">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brand Secondary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Brand Secondary (Green)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {brandSecondaryColors.map((color) => (
                    <div key={color.name} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-12 h-12 rounded-lg ${color.className} border border-border`}
                      />
                      <span className="text-caption text-muted-foreground">{color.name}</span>
                      <span className="text-overline text-muted-foreground">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brand Tertiary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Brand Tertiary (Dark Green)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {brandTertiaryColors.map((color) => (
                    <div key={color.name} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-12 h-12 rounded-lg ${color.className} border border-border`}
                      />
                      <span className="text-caption text-muted-foreground">{color.name}</span>
                      <span className="text-overline text-muted-foreground">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Surface Colors */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Surface (Neutrals)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {surfaceColors.map((color) => (
                    <div key={color.name} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-12 h-12 rounded-lg ${color.className} border border-border`}
                      />
                      <span className="text-caption text-muted-foreground">{color.name}</span>
                      <span className="text-overline text-muted-foreground">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Semantic Colors */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Semantic Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {semanticColors.map((color) => (
                    <div key={color.name} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-full h-16 rounded-lg ${color.className} flex items-center justify-center`}
                      >
                        <span className={`text-body-2 font-medium ${color.textClass}`}>{color.name}</span>
                      </div>
                      <span className="text-caption text-muted-foreground">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Buttons Section */}
          <section className="space-y-6">
            <h2 className="text-h3 font-heading text-foreground">Buttons</h2>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Primary Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="default">Default</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="default" disabled>Disabled</Button>
                  <Button variant="outline" disabled>Disabled</Button>
                  <Button variant="ghost" disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Secondary Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="secondary-outline">Secondary Outline</Button>
                  <Button variant="secondary-ghost">Secondary Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="secondary" disabled>Disabled</Button>
                  <Button variant="secondary-outline" disabled>Disabled</Button>
                  <Button variant="secondary-ghost" disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">🔔</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Spacing Section */}
          <section className="space-y-6">
            <h2 className="text-h3 font-heading text-foreground">Spacing</h2>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Border Radius</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6 items-end">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-secondary rounded-sm" />
                    <span className="text-caption text-muted-foreground">sm</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-secondary rounded" />
                    <span className="text-caption text-muted-foreground">default</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-secondary rounded-lg" />
                    <span className="text-caption text-muted-foreground">lg</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-secondary rounded-xl" />
                    <span className="text-caption text-muted-foreground">xl</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-secondary rounded-2xl" />
                    <span className="text-caption text-muted-foreground">2xl</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-secondary rounded-full" />
                    <span className="text-caption text-muted-foreground">full</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Semantic Tokens Section */}
          <section className="space-y-6">
            <h2 className="text-h3 font-heading text-foreground">Semantic Tokens</h2>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Background & Foreground</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="h-16 bg-background border border-border rounded-lg flex items-center justify-center">
                      <span className="text-foreground text-body-2">background</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-16 bg-card border border-border rounded-lg flex items-center justify-center">
                      <span className="text-card-foreground text-body-2">card</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-16 bg-muted border border-border rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground text-body-2">muted</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-16 bg-accent border border-border rounded-lg flex items-center justify-center">
                      <span className="text-accent-foreground text-body-2">accent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Component Gallery */}
          <section className="space-y-6">
            <h2 className="text-h3 font-heading text-foreground">Component Gallery</h2>

            {/* Cards */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-body-1">Basic Card</CardTitle>
                      <CardDescription>A simple card with description.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-body-2 text-muted-foreground">Card content goes here.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-body-1">Action Card</CardTitle>
                      <CardDescription>Card with a footer action.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-body-2 text-muted-foreground">Interactive card example.</p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm">Action</Button>
                    </CardFooter>
                  </Card>
                  <Card className="border-brand-tertiary-500">
                    <CardHeader>
                      <CardTitle className="text-body-1">Highlighted Card</CardTitle>
                      <CardDescription>With a branded border.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge>Tag 1</Badge>
                        <Badge variant="secondary">Tag 2</Badge>
                        <Badge variant="outline">Tag 3</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Form Controls */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Form Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="demo-input">Text Input</Label>
                    <Input id="demo-input" placeholder="Enter text..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-search">With Icon</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="demo-search" placeholder="Search..." className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-textarea">Textarea</Label>
                    <Textarea id="demo-textarea" placeholder="Write something..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Select</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opt1">Option 1</SelectItem>
                        <SelectItem value="opt2">Option 2</SelectItem>
                        <SelectItem value="opt3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <Label>Checkboxes</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="c1" defaultChecked />
                        <Label htmlFor="c1" className="font-normal">Checked</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="c2" />
                        <Label htmlFor="c2" className="font-normal">Unchecked</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Radio Group</Label>
                    <RadioGroup defaultValue="r1">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="r1" id="r1" />
                        <Label htmlFor="r1" className="font-normal">Option A</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="r2" id="r2" />
                        <Label htmlFor="r2" className="font-normal">Option B</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-4">
                    <Label>Switch</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch id="s1" defaultChecked />
                        <Label htmlFor="s1" className="font-normal">Enabled</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="s2" />
                        <Label htmlFor="s2" className="font-normal">Disabled</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Slider</Label>
                  <Slider defaultValue={[50]} max={100} step={1} className="max-w-sm" />
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList>
                    <TabsTrigger value="tab1">Overview</TabsTrigger>
                    <TabsTrigger value="tab2">Details</TabsTrigger>
                    <TabsTrigger value="tab3">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="p-4">
                    <p className="text-body-2 text-muted-foreground">Overview content panel.</p>
                  </TabsContent>
                  <TabsContent value="tab2" className="p-4">
                    <p className="text-body-2 text-muted-foreground">Details content panel.</p>
                  </TabsContent>
                  <TabsContent value="tab3" className="p-4">
                    <p className="text-body-2 text-muted-foreground">Settings content panel.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Accordion */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Accordion</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="a1">
                    <AccordionTrigger>What is this platform?</AccordionTrigger>
                    <AccordionContent>
                      An educational tool for media professionals to understand AI-generated content.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="a2">
                    <AccordionTrigger>How does prompt construction work?</AccordionTrigger>
                    <AccordionContent>
                      It explores how bias, specificity, context, and style affect AI outputs.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="a3">
                    <AccordionTrigger>Can I try it myself?</AccordionTrigger>
                    <AccordionContent>
                      Yes — the Prompt Playground lets you experiment freely.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Progress & Avatars & Tooltips */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Feedback & Display</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <Progress value={66} className="max-w-sm" />
                  <p className="text-caption text-muted-foreground">66% complete</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Avatars</Label>
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback className="bg-brand-secondary-500 text-foreground">AI</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback className="bg-brand-tertiary-500 text-white">MP</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Tooltips</Label>
                  <div className="flex gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon"><Info className="h-4 w-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>Informational tooltip</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>Notifications</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Icon Buttons */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-h5 font-heading">Icon Buttons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button size="icon"><Star className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline"><Mail className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost"><User className="h-4 w-4" /></Button>
                  <Button size="icon" variant="secondary"><Check className="h-4 w-4" /></Button>
                  <Button variant="outline" className="gap-2"><ChevronRight className="h-4 w-4" /> Continue</Button>
                  <Button variant="ghost" className="gap-2"><AlertCircle className="h-4 w-4" /> Warning</Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DesignSystem;
