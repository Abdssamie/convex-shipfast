declare module "degit" {
  type DegitOptions = {
    force?: boolean;
  };

  type DegitEmitter = {
    clone: (target: string) => Promise<void>;
  };

  const degit: (repo: string, options?: DegitOptions) => DegitEmitter;

  export default degit;
}
