import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
        </div>
      </main>
    </div>
  );
};

export default DesignSystem;
