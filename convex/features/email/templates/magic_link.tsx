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

export const subject = "Your FluxKit magic link";

type MagicLinkEmailProps = {
    magicLink: string;
    email: string;
};

export default function MagicLinkEmail({ magicLink, email }: MagicLinkEmailProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>Sign in to FluxKit with your magic link</Preview>
            <Body style={body}>
                <Container style={container}>
                    <Text style={logo}>FluxKit</Text>
                    <Text style={heading}>Sign in to FluxKit</Text>
                    <Text style={paragraph}>
                        Hi {email},
                    </Text>
                    <Text style={paragraph}>
                        Click the button below to sign in to your FluxKit account. This link
                        is valid for 15 minutes and can only be used once.
                    </Text>
                    <Button style={button} href={magicLink}>
                        Sign In
                    </Button>
                    <Text style={paragraph}>
                        Or copy and paste this link into your browser:
                    </Text>
                    <Link href={magicLink} style={link}>
                        {magicLink}
                    </Link>
                    <Text style={footer}>
                        If you did not request this link, you can safely ignore this email.
                        Someone may have entered your email address by mistake.
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
