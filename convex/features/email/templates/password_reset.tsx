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

export const subject = "Reset your FluxKit password";

type PasswordResetEmailProps = {
    resetUrl: string;
    email: string;
    name: string;
};

export default function PasswordResetEmail({
    resetUrl,
    email,
    name,
}: PasswordResetEmailProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>Reset your FluxKit password</Preview>
            <Body style={body}>
                <Container style={container}>
                    <Text style={logo}>FluxKit</Text>
                    <Text style={heading}>Reset your password</Text>
                    <Text style={paragraph}>
                        Hi {name || email},
                    </Text>
                    <Text style={paragraph}>
                        We received a request to reset the password for your FluxKit account.
                        Click the button below to choose a new password.
                    </Text>
                    <Button style={button} href={resetUrl}>
                        Reset Password
                    </Button>
                    <Text style={paragraph}>
                        Or copy and paste this link into your browser:
                    </Text>
                    <Link href={resetUrl} style={link}>
                        {resetUrl}
                    </Link>
                    <Text style={footer}>
                        This link expires in 1 hour. If you did not request a password reset,
                        you can safely ignore this email — your password will not change.
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
