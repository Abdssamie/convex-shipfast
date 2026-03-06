import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Text,
} from "@react-email/components";

export const subject = "Welcome to FluxKit!";

type WelcomeEmailProps = {
    appName: string;
    userName: string;
};

export default function WelcomeEmail({ appName, userName }: WelcomeEmailProps) {
    const displayName = userName || "there";

    return (
        <Html lang="en">
            <Head />
            <Preview>Welcome to {appName} — you're all set!</Preview>
            <Body style={body}>
                <Container style={container}>
                    <Text style={logo}>FluxKit</Text>
                    <Text style={heading}>Welcome to {appName}!</Text>
                    <Text style={paragraph}>Hi {displayName},</Text>
                    <Text style={paragraph}>
                        Thanks for signing up! We're excited to have you on board.
                    </Text>
                    <Text style={paragraph}>Here's what you can do next:</Text>
                    <Text style={listItem}>→ Complete your profile</Text>
                    <Text style={listItem}>→ Explore the dashboard</Text>
                    <Text style={listItem}>→ Check out the getting started guide</Text>
                    <Text style={paragraph}>
                        If you have any questions, feel free to reach out — we're always
                        happy to help.
                    </Text>
                    <Text style={footer}>
                        Best regards,
                        {"\n"}The {appName} Team
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const body = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 32px",
    borderRadius: "8px",
    maxWidth: "560px",
};

const logo = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 24px",
};

const heading = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 16px",
};

const paragraph = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#475569",
    margin: "0 0 16px",
};

const listItem = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#475569",
    margin: "0 0 8px",
    paddingLeft: "8px",
};

const footer = {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "32px",
    whiteSpace: "pre-line" as const,
};
