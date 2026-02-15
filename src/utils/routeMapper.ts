import { handleError } from '../middleware/errorHandler';

type RouteHandler = (req: Request) => Promise<Response> | Response;

type RouteConfig = {
  [path: string]: {
    [method: string]: RouteHandler;
  };
};

export function mapRoutesForBun(routes: RouteConfig) {
  const bunRoutes: Record<string, any> = {};

  for (const [path, methods] of Object.entries(routes)) {
    bunRoutes[path] = {};

    for (const [method, handler] of Object.entries(methods)) {
      bunRoutes[path][method] = async (req: Request) => {
        try {
          return await handler(req);
        } catch (error) {
          return handleError(error as Error);
        }
      };
    }
  }

  return bunRoutes;
}
