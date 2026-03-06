import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Text,
    Button,
    Link,
} from "@react-email/components";

export const subject = "Verify your FluxKit email address";

type VerificationEmailProps = {
    verificationUrl: string;
    email: string;
    name: string;
};

export default function VerificationEmail({
    verificationUrl,
    email,
    name,
}: VerificationEmailProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>Verify your email address for FluxKit</Preview>
            <Body style={body}>
                <Container style={container}>
                    <Text style={logo}>FluxKit</Text>
                    <Text style={heading}>Verify your email</Text>
                    <Text style={paragraph}>
                        Hi {name || email},
                    </Text>
                    <Text style={paragraph}>
                        Thanks for signing up! Please verify your email address by clicking
                        the button below.
                    </Text>
                    <Button style={button} href={verificationUrl}>
                        Verify Email Address
                    </Button>
                    <Text style={paragraph}>
                        Or copy and paste this link into your browser:
                    </Text>
                    <Link href={verificationUrl} style={link}>
                        {verificationUrl}
                    </Link>
                    <Text style={footer}>
                        This link expires in 24 hours. If you did not create a FluxKit
                        account, you can safely ignore this email.
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

const button = {
    backgroundColor: "#0f172a",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
    margin: "24px 0",
};

const link = {
    color: "#6366f1",
    fontSize: "13px",
    wordBreak: "break-all" as const,
};

const footer = {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "32px",
};
