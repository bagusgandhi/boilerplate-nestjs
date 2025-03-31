export type DeploymentPayload = {
  data: {
    db_name: string;
    db_user: string;
    db_password: string;
    demo: string;
    port: number;
    domain_name: string;
  };
};
