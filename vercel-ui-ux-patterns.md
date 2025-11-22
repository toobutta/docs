# Vercel UI/UX Patterns & Design Systems

**Research Focus:** Modern UI/UX implementations from Vercel's ecosystem
**Last Updated:** November 8, 2025

---

## Table of Contents
1. [Design System Overview](#design-system-overview)
2. [Component Patterns](#component-patterns)
3. [Layout Patterns](#layout-patterns)
4. [AI Chat Interface Patterns](#ai-chat-interface-patterns)
5. [Dashboard Patterns](#dashboard-patterns)
6. [E-Commerce Patterns](#e-commerce-patterns)
7. [Forms & Input Patterns](#forms--input-patterns)
8. [Loading & Skeleton States](#loading--skeleton-states)
9. [Animation Patterns](#animation-patterns)
10. [Responsive Design Patterns](#responsive-design-patterns)

---

## Design System Overview

### Primary Design System: shadcn/ui

**Why shadcn/ui Dominates:**
- Copy-paste components (not npm package)
- Built on Radix UI primitives
- Fully customizable with Tailwind
- Type-safe with TypeScript
- Accessible by default (ARIA compliant)
- Works seamlessly with Next.js App Router

**Core Philosophy:**
```
"Not a component library. It's a collection of re-usable components
that you can copy and paste into your apps."
```

**Official Resources:**
- Website: https://ui.shadcn.com/
- Components: https://ui.shadcn.com/docs/components
- Themes: https://ui.shadcn.com/themes
- Examples: https://ui.shadcn.com/examples

---

## Component Patterns

### 1. Button Patterns

**Variants from vercel/ai-chatbot:**

```tsx
// Primary action - High emphasis
<Button variant="default" size="lg">
  Start Chatting
</Button>

// Secondary action - Medium emphasis
<Button variant="outline" size="default">
  View Examples
</Button>

// Tertiary action - Low emphasis
<Button variant="ghost" size="sm">
  Cancel
</Button>

// Destructive action - Warning
<Button variant="destructive" size="default">
  Delete Chat
</Button>

// Icon button - Minimal
<Button variant="ghost" size="icon">
  <IconTrash />
</Button>
```

**Button States:**
- Loading state with spinner
- Disabled state (reduced opacity)
- Hover state (subtle background change)
- Focus state (ring for accessibility)
- Active/pressed state

---

### 2. Card Patterns

**From vercel/commerce & dashboards:**

```tsx
// Product card
<Card className="overflow-hidden hover:shadow-lg transition-shadow">
  <CardHeader className="p-0">
    <Image /> {/* Product image */}
  </CardHeader>
  <CardContent className="p-4">
    <CardTitle>Product Name</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardContent>
  <CardFooter className="p-4 pt-0">
    <Button>Add to Cart</Button>
  </CardFooter>
</Card>

// Stat card
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">
      Total Revenue
    </CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">
      +20.1% from last month
    </p>
  </CardContent>
</Card>
```

**Card Variations:**
- Hover elevation
- Interactive cards (clickable)
- Loading cards (skeleton)
- Empty state cards
- Error state cards

---

### 3. Dialog/Modal Patterns

**From vercel/ai-chatbot:**

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Settings</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Form content */}
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Modal Best Practices:**
- Keyboard navigation (ESC to close)
- Focus trap
- Backdrop click to close
- Smooth enter/exit animations
- Mobile-responsive (full screen on mobile)

---

### 4. Navigation Patterns

#### Sidebar Navigation (Dashboard)
**From admin templates:**

```tsx
// Collapsible sidebar
<div className="flex h-screen">
  <aside className="w-64 border-r bg-background">
    <div className="flex h-14 items-center border-b px-4">
      <Logo />
    </div>
    <nav className="flex-1 overflow-y-auto p-4">
      <NavItem icon={<Home />} href="/dashboard">
        Dashboard
      </NavItem>
      <NavItem icon={<Users />} href="/users">
        Users
      </NavItem>
      {/* More items */}
    </nav>
  </aside>
  <main className="flex-1 overflow-y-auto">
    {children}
  </main>
</div>
```

**Features:**
- Active state highlighting
- Collapsible on mobile
- Nested menu items
- Icon + text
- Keyboard accessible

#### Header Navigation (Marketing/Commerce)
**From vercel/commerce:**

```tsx
<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
  <nav className="container flex h-16 items-center justify-between">
    <div className="flex items-center gap-6">
      <Logo />
      <NavLinks />
    </div>
    <div className="flex items-center gap-4">
      <SearchButton />
      <CartButton />
      <UserMenu />
    </div>
  </nav>
</header>
```

**Features:**
- Sticky on scroll
- Backdrop blur effect
- Mobile menu (hamburger)
- Search integration
- Cart with badge count

---

## Layout Patterns

### 1. Dashboard Layout

**Three-Column Layout (Common in admin panels):**

```
┌─────────────────────────────────────────┐
│          Header (Logo, Search)          │
├────────┬───────────────────────┬────────┤
│        │                       │        │
│ Side   │   Main Content        │ Right  │
│ Nav    │   (Data Tables,       │ Panel  │
│        │    Charts, Cards)     │ (Info) │
│        │                       │        │
└────────┴───────────────────────┴────────┘
```

**From vercel/nextjs-postgres-nextauth-tailwindcss-template:**

```tsx
<div className="flex h-screen flex-col">
  <Header />
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-8">
      {children}
    </main>
    <RightPanel />
  </div>
</div>
```

---

### 2. Marketing Layout

**Hero + Features + CTA Pattern:**

```
┌─────────────────────────────────────────┐
│            Navigation                    │
├─────────────────────────────────────────┤
│                                          │
│         Hero Section                     │
│    (Large heading, subtitle, CTA)       │
│                                          │
├─────────────────────────────────────────┤
│         Features Grid                    │
│    [Card] [Card] [Card]                 │
│                                          │
├─────────────────────────────────────────┤
│         Testimonials                     │
│                                          │
├─────────────────────────────────────────┤
│         Pricing                          │
│                                          │
├─────────────────────────────────────────┤
│         Footer                           │
└─────────────────────────────────────────┘
```

**From SaaS templates:**

```tsx
<div className="flex min-h-screen flex-col">
  <Header />
  <main>
    <HeroSection />
    <FeaturesSection />
    <TestimonialsSection />
    <PricingSection />
    <CTASection />
  </main>
  <Footer />
</div>
```

---

### 3. Chat Layout

**Split View Pattern:**

```
┌─────────────────────────────────────────┐
│            Header                        │
├──────────┬──────────────────────────────┤
│          │                              │
│ Chat     │   Main Chat                  │
│ History  │   [User message]             │
│ Sidebar  │   [AI response]              │
│          │   [User message]             │
│          │   [AI response]              │
│          │                              │
│          │   ┌──────────────────────┐  │
│          │   │  Input field         │  │
│          │   └──────────────────────┘  │
└──────────┴──────────────────────────────┘
```

**From vercel/ai-chatbot:**

```tsx
<div className="flex h-screen flex-col">
  <Header />
  <div className="flex flex-1 overflow-hidden">
    <ChatSidebar /> {/* Chat history */}
    <div className="flex flex-1 flex-col">
      <ChatMessages /> {/* Scrollable messages */}
      <ChatInput /> {/* Fixed at bottom */}
    </div>
  </div>
</div>
```

---

## AI Chat Interface Patterns

### 1. Message Bubble Pattern

**User Message:**
```tsx
<div className="flex justify-end">
  <div className="max-w-[80%] rounded-lg bg-primary px-4 py-2 text-primary-foreground">
    {message.content}
  </div>
</div>
```

**AI Message:**
```tsx
<div className="flex justify-start gap-3">
  <Avatar>
    <AvatarImage src="/ai-avatar.png" />
  </Avatar>
  <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
    {message.content}
  </div>
</div>
```

**Features:**
- Avatar differentiation
- Color coding (user vs AI)
- Markdown rendering
- Code syntax highlighting
- Copy button for code blocks
- Timestamp
- Regenerate button (AI messages)

---

### 2. Streaming Message Pattern

**From vercel/ai-chatbot:**

```tsx
// Streaming indicator
<div className="flex items-center gap-2">
  <Loader2 className="h-4 w-4 animate-spin" />
  <span className="text-sm text-muted-foreground">
    AI is thinking...
  </span>
</div>

// Streamed content with cursor
<div className="markdown prose">
  {streamedContent}
  <span className="animate-pulse">▊</span>
</div>
```

**Animation States:**
1. Waiting: Spinner + "Thinking..."
2. Streaming: Content appears word by word
3. Complete: Full message + actions (copy, regenerate)

---

### 3. Generative UI Pattern

**From vercel-labs/gemini-chatbot:**

```tsx
// AI can return React components instead of text
<div className="not-prose">
  {message.type === 'component' ? (
    // Render interactive component
    <StockPrice symbol="AAPL" />
  ) : (
    // Render text
    <Markdown>{message.content}</Markdown>
  )}
</div>
```

**Examples of Generative UI:**
- Interactive charts
- Form components
- Product cards
- Calendar widgets
- Maps
- Buttons with actions

---

### 4. Chat Input Pattern

**Multi-line Input with Actions:**

```tsx
<div className="border-t bg-background p-4">
  <div className="relative">
    <Textarea
      placeholder="Send a message..."
      className="min-h-[60px] pr-16"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          handleSubmit()
        }
      }}
    />
    <div className="absolute bottom-2 right-2 flex gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleAttachment}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!input.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
```

**Features:**
- Auto-resize textarea
- Submit on Enter (Shift+Enter for new line)
- Attachment button
- Character/token counter
- Disabled state when empty
- Voice input option

---

### 5. Suggested Prompts Pattern

**From vercel/ai-chatbot:**

```tsx
// Empty state with suggestions
<div className="flex flex-col items-center justify-center p-8">
  <h2 className="text-2xl font-bold">How can I help you today?</h2>
  <div className="mt-8 grid gap-4 sm:grid-cols-2">
    {suggestions.map((suggestion) => (
      <Card
        key={suggestion.id}
        className="cursor-pointer hover:bg-accent"
        onClick={() => handlePrompt(suggestion.prompt)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <suggestion.icon className="h-5 w-5" />
            <div>
              <h3 className="font-medium">{suggestion.title}</h3>
              <p className="text-sm text-muted-foreground">
                {suggestion.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

---

## Dashboard Patterns

### 1. Stats Cards (KPIs)

**Grid Layout:**

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">
        Total Revenue
      </CardTitle>
      <DollarSign className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">$45,231.89</div>
      <p className="text-xs text-muted-foreground">
        <span className="text-green-600">+20.1%</span> from last month
      </p>
    </CardContent>
  </Card>
  {/* More stat cards */}
</div>
```

**Design Elements:**
- Large number (primary metric)
- Icon indicator
- Trend indicator (up/down arrow + percentage)
- Color coding (green = good, red = bad)
- Comparison period label

---

### 2. Data Table Pattern

**From Kiranism/next-shadcn-dashboard-starter:**

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Recent Orders</CardTitle>
      <div className="flex gap-2">
        <Input placeholder="Search..." />
        <Button variant="outline" size="icon">
          <Filter />
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.customer}</TableCell>
            <TableCell>{row.amount}</TableCell>
            <TableCell>
              <Badge variant={row.status}>
                {row.status}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <div className="flex items-center justify-between pt-4">
      <div className="text-sm text-muted-foreground">
        Showing 1-10 of 100
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

**Features:**
- Search/filter controls
- Sortable columns
- Row actions (dropdown menu)
- Status badges
- Pagination
- Bulk actions (checkbox selection)
- Empty state
- Loading skeleton

---

### 3. Chart Patterns

**Using Recharts:**

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

<Card>
  <CardHeader>
    <CardTitle>Revenue Trend</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

**Chart Types Used:**
- Line charts (trends over time)
- Bar charts (comparisons)
- Pie/Donut charts (proportions)
- Area charts (volume over time)
- Sparklines (inline metrics)

**Design Tips:**
- Use theme colors (hsl variables)
- Responsive container
- Tooltips for details
- Legend for multiple series
- Grid for readability

---

### 4. Filter Sidebar Pattern

```tsx
<div className="flex gap-6">
  {/* Filter sidebar */}
  <aside className="w-64 space-y-4">
    <div>
      <h3 className="mb-2 font-medium">Date Range</h3>
      <DateRangePicker />
    </div>
    <div>
      <h3 className="mb-2 font-medium">Status</h3>
      <div className="space-y-2">
        <Checkbox label="Active" />
        <Checkbox label="Pending" />
        <Checkbox label="Completed" />
      </div>
    </div>
    <Button className="w-full">Apply Filters</Button>
  </aside>

  {/* Main content */}
  <main className="flex-1">
    {/* Filtered results */}
  </main>
</div>
```

---

## E-Commerce Patterns

### 1. Product Grid

**From vercel/commerce:**

```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {products.map((product) => (
    <Link key={product.id} href={`/product/${product.id}`}>
      <Card className="group overflow-hidden">
        <div className="aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            {product.category}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold">
              ${product.price}
            </span>
            {product.discount && (
              <Badge variant="destructive">
                -{product.discount}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  ))}
</div>
```

**Features:**
- Responsive grid (1-4 columns)
- Hover effects (image scale)
- Badge for discounts
- Quick view option
- Add to cart button (on hover)

---

### 2. Product Page Layout

```
┌─────────────────────────────────────────┐
│  Breadcrumbs: Home > Category > Product │
├──────────────────┬──────────────────────┤
│                  │                      │
│  Product Images  │  Product Details     │
│  (Gallery)       │  - Title             │
│                  │  - Rating            │
│                  │  - Price             │
│                  │  - Description       │
│                  │  - Variants          │
│                  │  - Quantity          │
│                  │  - Add to Cart       │
│                  │  - Wishlist          │
│                  │                      │
├──────────────────┴──────────────────────┤
│  Related Products                       │
└─────────────────────────────────────────┘
```

---

### 3. Shopping Cart Pattern

**Slide-over Panel:**

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="icon" className="relative">
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-2 -top-2 h-5 w-5 p-0"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  </SheetTrigger>
  <SheetContent className="flex w-full flex-col sm:max-w-lg">
    <SheetHeader>
      <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
    </SheetHeader>
    <div className="flex-1 overflow-y-auto py-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 border-b py-4">
          <Image
            src={item.image}
            alt={item.name}
            className="h-20 w-20 rounded"
          />
          <div className="flex-1">
            <h4 className="font-medium">{item.name}</h4>
            <p className="text-sm text-muted-foreground">
              ${item.price}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={decreaseQty}>
                <Minus className="h-3 w-3" />
              </Button>
              <span>{item.quantity}</span>
              <Button size="icon" variant="outline" onClick={increaseQty}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={removeItem}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
    <div className="border-t pt-4">
      <div className="flex justify-between mb-4">
        <span className="font-medium">Total</span>
        <span className="text-lg font-bold">${total}</span>
      </div>
      <Button className="w-full" size="lg">
        Checkout
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

---

## Forms & Input Patterns

### 1. Server Action Form

**From komzweb/nextjs-server-actions-form:**

```tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createUser } from '@/app/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        'Create User'
      )}
    </Button>
  )
}

export function UserForm() {
  const [state, formAction] = useFormState(createUser, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          required
        />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">
            {state.errors.name}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
        />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">
            {state.errors.email}
          </p>
        )}
      </div>

      <SubmitButton />

      {state?.message && (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </form>
  )
}
```

**Features:**
- Server Actions integration
- Loading state with useFormStatus
- Field-level validation errors
- Success/error messages
- Progressive enhancement (works without JS)

---

### 2. Form Validation Pattern

**Using Zod + shadcn/ui forms:**

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export function SignupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

---

### 3. Multi-Step Form Pattern

```tsx
const steps = ['Account', 'Profile', 'Preferences']

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step}
              className={cn(
                "flex items-center",
                index < currentStep && "text-primary"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                index < currentStep && "border-primary bg-primary text-primary-foreground",
                index === currentStep && "border-primary",
                index > currentStep && "border-muted"
              )}>
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className="ml-2 text-sm font-medium">{step}</span>
              {index < steps.length - 1 && (
                <div className="mx-4 h-0.5 w-12 bg-muted" />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {currentStep === 0 && <AccountStep />}
        {currentStep === 1 && <ProfileStep />}
        {currentStep === 2 && <PreferencesStep />}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(s => s - 1)}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(s => s + 1)}
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

---

## Loading & Skeleton States

### 1. Skeleton Components

**Card Skeleton:**

```tsx
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[125px] w-full" />
      </CardContent>
    </Card>
  )
}
```

**Table Skeleton:**

```tsx
export function TableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {[1, 2, 3, 4].map((i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-full" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            {[1, 2, 3, 4].map((j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

### 2. Loading States with Suspense

**From Next.js App Router:**

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<CardSkeleton />}>
        <AsyncCard />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <AsyncTable />
      </Suspense>
    </div>
  )
}
```

---

### 3. Progressive Loading Pattern

```tsx
// Show content as it loads
export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Loads immediately */}
      <StatsCards />

      {/* Loads after stats */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      {/* Loads after chart */}
      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}
```

---

## Animation Patterns

### 1. Framer Motion Patterns

**Page Transitions:**

```tsx
import { motion } from 'framer-motion'

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

**Stagger Children:**

```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

### 2. CSS Animations

**From shadcn/ui:**

```css
/* Fade in */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Slide in */
@keyframes slide-in-from-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in-from-right 0.3s ease-out;
}
```

---

## Responsive Design Patterns

### 1. Mobile-First Breakpoints

**Tailwind CSS (default in all templates):**

```tsx
<div className="
  grid
  grid-cols-1        // Mobile: 1 column
  sm:grid-cols-2     // Small: 2 columns
  md:grid-cols-3     // Medium: 3 columns
  lg:grid-cols-4     // Large: 4 columns
  gap-4
">
  {items.map(item => <Card key={item.id} />)}
</div>
```

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

### 2. Responsive Navigation

```tsx
// Desktop: Full nav
// Mobile: Hamburger menu

<header>
  {/* Desktop */}
  <nav className="hidden md:flex gap-6">
    <NavLink href="/">Home</NavLink>
    <NavLink href="/about">About</NavLink>
    <NavLink href="/contact">Contact</NavLink>
  </nav>

  {/* Mobile */}
  <Sheet>
    <SheetTrigger className="md:hidden">
      <Menu />
    </SheetTrigger>
    <SheetContent side="left">
      <nav className="flex flex-col gap-4">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
      </nav>
    </SheetContent>
  </Sheet>
</header>
```

---

## Color & Theme Patterns

### 1. CSS Variables for Theming

**From shadcn/ui:**

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

### 2. Theme Toggle Pattern

```tsx
'use client'

import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Accessibility Patterns

### Key Principles from Vercel Templates:

1. **Keyboard Navigation**
   - All interactive elements accessible via Tab
   - Escape key closes modals
   - Arrow keys for navigation

2. **ARIA Labels**
   - Proper labels for screen readers
   - Role attributes
   - Live regions for dynamic content

3. **Focus Management**
   - Visible focus indicators
   - Focus trap in modals
   - Focus restoration after modal close

4. **Color Contrast**
   - WCAG AA compliant
   - Don't rely on color alone
   - Test with tools

5. **Semantic HTML**
   - Proper heading hierarchy
   - Meaningful link text
   - Form labels

---

## Best Practices Summary

### 1. Component Organization
- Use compound components for complex UI
- Keep components small and focused
- Separate client and server components
- Use TypeScript for type safety

### 2. Styling
- Use Tailwind CSS utilities
- Create reusable component variants
- Use CSS variables for theming
- Mobile-first responsive design

### 3. Performance
- Server Components by default
- Lazy load heavy components
- Optimize images with next/image
- Use Suspense for loading states

### 4. User Experience
- Immediate feedback for actions
- Optimistic updates where possible
- Clear error messages
- Loading states for all async operations
- Keyboard shortcuts for power users

### 5. Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast
- Screen reader support

---

## Resources for Learning UI/UX

### Official Resources
- shadcn/ui examples: https://ui.shadcn.com/examples
- Tailwind UI: https://tailwindui.com/
- Radix UI: https://www.radix-ui.com/
- Vercel Design: https://vercel.com/design

### Inspiration
- Dribbble: https://dribbble.com/
- Behance: https://www.behance.net/
- Awwwards: https://www.awwwards.com/
- Mobbin (mobile): https://mobbin.com/

### Learning
- Refactoring UI: https://www.refactoringui.com/
- Laws of UX: https://lawsofux.com/
- Material Design: https://m3.material.io/

---

**Document Purpose:** UI/UX pattern reference for building modern web applications
**Last Updated:** November 8, 2025
**Focus:** Practical, copy-paste patterns from production Vercel projects
