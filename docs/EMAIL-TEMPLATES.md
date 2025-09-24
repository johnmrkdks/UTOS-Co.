# Email Template Design System

## React Email Implementation (January 2025)

Down Under Chauffeurs uses React Email for professional, consistent email templates that match the driver interface design system.

**Template Architecture:**
- **Trip Status Notifications**: Customer trip updates with status-based styling
- **Driver Assignment Emails**: Professional assignment notifications for drivers
- **Brand Consistency**: Matching design language with driver trips interface
- **Status-Based Styling**: Dynamic colors based on trip status

**Key Features:**
- **Professional Header**: Down Under Chauffeurs branding with teal gradient
- **Status Badges**: Color-coded status indicators (blue, yellow, orange, green, purple, gray)
- **Route Visualization**: Visual route indicators with colored dots for pickup, stops, and destination
- **Responsive Design**: Email client compatibility with consistent styling
- **Comprehensive Trip Data**: Passenger count, stops, vehicle information, and customer details

## Template Files

**Template Files:**
- `packages/mail/src/react-templates/trip-status-email.tsx`: Customer notifications
- `packages/mail/src/react-templates/driver-assignment-email.tsx`: Driver assignments
- `packages/mail/src/react-templates/index.ts`: Template rendering functions and type definitions

## Integration

**Integration:**
- `apps/server/src/services/notifications/booking-email-notification-service.ts`: Email service integration
- Uses React Email rendering with proper type safety and error handling
- Supports stops data, passenger counts, and comprehensive booking information

## Template Examples

### Trip Status Email Template

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

const TripStatusEmail = ({
  customerName,
  statusTitle,
  status,
  pickupDateTime,
  pickupAddress,
  destinationAddress,
  stops,
  passengerCount,
  vehicleInfo,
  driverInfo,
}: TripStatusData) => {
  const statusStyle = getStatusStyle(status);

  return (
    <Html>
      <Head />
      <Preview>{statusTitle} - Your trip with Down Under Chauffeurs</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Professional header with branding */}
          <Section style={header}>
            <Heading style={headerTitle}>Down Under Chauffeurs</Heading>
          </Section>

          {/* Status badge */}
          <Section style={statusSection}>
            <Text style={statusBadge}>
              {statusTitle}
            </Text>
          </Section>

          {/* Trip details with route visualization */}
          <Section style={tripDetails}>
            <Text style={detailRow}>
              <Text style={label}>Passenger:</Text>
              <Text style={value}>{customerName}</Text>
            </Text>

            <Text style={detailRow}>
              <Text style={label}>Pickup:</Text>
              <Text style={value}>{pickupDateTime}</Text>
            </Text>

            {/* Route visualization */}
            <Section style={routeSection}>
              <Text style={routeItem}>
                <Text style={{ ...routeDot, backgroundColor: "#10b981" }}>●</Text>
                {pickupAddress}
              </Text>

              {stops?.map((stop, index) => (
                <Text key={index} style={routeItem}>
                  <Text style={{ ...routeDot, backgroundColor: "#f59e0b" }}>●</Text>
                  {stop.address}
                </Text>
              ))}

              <Text style={routeItem}>
                <Text style={{ ...routeDot, backgroundColor: "#ef4444" }}>●</Text>
                {destinationAddress}
              </Text>
            </Section>
          </Section>

          {/* Action button */}
          <Section style={buttonSection}>
            <Button style={button} href="https://downunderchauffeurs.com/customer">
              View Trip Details
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
```

### Driver Assignment Email Template

```tsx
const DriverAssignmentEmail = ({
  driverName,
  customerName,
  pickupDateTime,
  pickupAddress,
  destinationAddress,
  stops,
  passengerCount,
  vehicleInfo,
}: DriverAssignmentData) => {
  return (
    <Html>
      <Head />
      <Preview>New Trip Assignment - Down Under Chauffeurs</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Professional header */}
          <Section style={header}>
            <Heading style={headerTitle}>Down Under Chauffeurs</Heading>
          </Section>

          {/* Assignment notification */}
          <Section style={assignmentSection}>
            <Text style={assignmentBadge}>
              New Assignment
            </Text>
          </Section>

          {/* Trip details */}
          <Section style={tripDetails}>
            <Text style={greeting}>
              Hello {driverName},
            </Text>

            <Text style={paragraph}>
              You have been assigned a new trip. Please review the details below:
            </Text>

            <Text style={detailRow}>
              <Text style={label}>Customer:</Text>
              <Text style={value}>{customerName}</Text>
            </Text>

            <Text style={detailRow}>
              <Text style={label}>Passengers:</Text>
              <Text style={value}>{passengerCount}</Text>
            </Text>

            <Text style={detailRow}>
              <Text style={label}>Vehicle:</Text>
              <Text style={value}>{vehicleInfo}</Text>
            </Text>
          </Section>

          {/* Action button */}
          <Section style={buttonSection}>
            <Button style={driverButton} href="https://downunderchauffeurs.com/driver">
              View Driver Dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
```

## Status-Based Styling

```typescript
const getStatusStyle = (status?: string) => {
  const statusColors = {
    pending: "#3b82f6",        // Blue
    confirmed: "#eab308",      // Yellow
    driver_assigned: "#f97316", // Orange
    in_progress: "#10b981",    // Green
    completed: "#8b5cf6",      // Purple
    cancelled: "#6b7280",      // Gray
  };

  return {
    backgroundColor: statusColors[status as keyof typeof statusColors] || "#3b82f6",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
  };
};
```

## TypeScript Interfaces

```typescript
export interface TripStatusData {
  customerName: string;
  statusTitle: string;
  status?: string;
  pickupDateTime: string;
  pickupAddress: string;
  destinationAddress: string;
  stops?: Array<{ address: string }>;
  passengerCount?: number;
  vehicleInfo?: string;
  driverInfo?: string;
}

export interface DriverAssignmentData {
  driverName: string;
  customerName: string;
  pickupDateTime: string;
  pickupAddress: string;
  destinationAddress: string;
  stops?: Array<{ address: string }>;
  passengerCount?: number;
  vehicleInfo?: string;
}
```

## Rendering Functions

```typescript
import { render } from "@react-email/render";
import { TripStatusEmail, DriverAssignmentEmail } from "./react-templates";

export const renderTripStatusEmail = async (data: TripStatusData): Promise<string> => {
  return await render(<TripStatusEmail {...data} />);
};

export const renderDriverAssignmentEmail = async (data: DriverAssignmentData): Promise<string> => {
  return await render(<DriverAssignmentEmail {...data} />);
};
```

## Integration with Email Service

```typescript
// apps/server/src/services/notifications/booking-email-notification-service.ts
import { renderTripStatusEmail, renderDriverAssignmentEmail } from "@workspace/mail";

export class BookingEmailNotificationService {
  async sendTripStatusNotification(booking: Booking, status: string) {
    const template = await renderTripStatusEmail({
      customerName: customer?.name || "Customer",
      statusTitle: this.getStatusTitle(status),
      status,
      pickupDateTime: formatDateTime(booking.pickupDateTime),
      pickupAddress: booking.pickupAddress,
      destinationAddress: booking.destinationAddress,
      stops: stops?.map(stop => ({ address: stop.address })) || [],
      passengerCount: booking.passengerCount || 1,
      vehicleInfo: car ? `${car.brand?.name} ${car.model?.name}` : "Luxury Vehicle",
    });

    await this.sendEmail({
      to: customer?.email,
      subject: `Trip ${this.getStatusTitle(status)} - Down Under Chauffeurs`,
      html: template,
    });
  }
}
```

## Design Features

- **Professional Header**: Teal gradient header with Down Under Chauffeurs branding
- **Status Indicators**: Color-coded badges that match trip status (blue, yellow, orange, green, purple, gray)
- **Route Visualization**: Visual route display with colored dots for pickup (green), stops (amber), and destination (red)
- **Responsive Layout**: Email client compatible design with consistent spacing and typography
- **Brand Consistency**: Matches the driver trips interface design language for unified brand experience
- **Comprehensive Data**: Displays all relevant trip information including passenger count, stops, and vehicle details