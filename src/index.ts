import express, { Response, Request, NextFunction } from 'express';
import ClassesController from './classes/controller';
import UsersController from './users/controller';
import JoinRequestController from './joinRequests/controller';
import MessageController from './messages/controller';
const app = express();
const port = process.env.API_PORT;

const logRequest = (req: Request, res: Response, next: NextFunction) => {
    console.log(`(${req.method}) ${req.originalUrl} - ${req.socket.remoteAddress} - ${new Date().toISOString()}`)   
    next();
}

app.use(express.json());
app.use(logRequest);
app.use('/api/v1/class/request', [JoinRequestController()])
app.use('/api/v1/', [ClassesController(), UsersController()]);
app.use('/api/v1/class', [MessageController()])

app.listen(port);
