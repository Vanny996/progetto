import express from 'express';
import {registerRoutes}from'./src/routes/route.js';
import {connect} from './dataBase.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument} from "./src/config/swaggerDocument.js";



const host ='localhost';
const port = 8003;
const app = express();

app.use(express.json());
registerRoutes(app);

await connect()
registerRoutes(app);

app.use((err, req, res, next) => {
    if (err?.error && err.error.isJoi) {
        res.status(400).json({ type: err.type, message: err.error.toString() });
    }else {
        next(err);
    }
});

app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerDocument));
app.listen(port,host,()=>{
    console.log(`server avviato ${host}:${port}`);
})

export default app;