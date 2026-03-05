# Codebase Guidelines

To keep this codebase maintainable and avoid generating technical debt ("slop"), all AI agents must adhere to the following strict rules:

1. **TypeScript Strictness**: Never use the `any` type. Always define and use proper, precise interfaces and types.
2. **React Hooks**: Minimize use of `useEffect`. Never use `setState` inside `useEffect`. Calculate derived state during rendering and handle logic in event handlers.
3. **No Over-Engineering**: Adhere to existing patterns. Use prebuilt or existing open-source tools before proposing custom implementations.
4. **Clean & Concise Code**: Avoid generating excessive boilerplate or "slop". Make surgical, precise edits instead of large unnecessary rewrites. Clean up unused imports and dead code.
5. **Testing & Architecture**: Follow contract-first architecture for external services (like Auth). Design APIs to be testable (e.g., using dependency injection or bypass headers for staging).
6. **No Surprises**: Do not push changes to remote or make structural assumptions without explicit user confirmation. Keep logic readable, self-documenting, and focused.
7. **Dump mistakes you usually make**: For God's sake stop writing more code just to solve a problem that can be solved with a simple configuration change or by using an existing feature of the framework or whatever techonology used. Every time you make a dump shit implmentation of a fix or a feature and the user complains, dump it here, and mark it as bad practice that should never be implmented
