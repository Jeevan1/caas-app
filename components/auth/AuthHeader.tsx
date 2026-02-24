import { LucideProps } from "lucide-react";
import React, { ForwardRefExoticComponent, RefAttributes } from "react";

const AuthHeader = ({
  icon: Icon,
  title,
  children,
}: {
  icon:
    | ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >
    | string;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
        {typeof Icon === "string" ? (
          Icon
        ) : (
          <Icon className="h-5 w-5 text-primary" />
        )}
      </div>
      <h2 className="font-heading text-xl font-bold text-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default AuthHeader;
