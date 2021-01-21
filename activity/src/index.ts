import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from './utils/nats-wrapper';
import { UserCreatedListener } from './listeners/user-created-listener';
import { ActivityGroupCreatedListener } from './listeners/activity-group-created-listener';
import { ActivityGroupDeletedListener } from './listeners/activity-group-deleted-listener';
import { ActivityGroupAddedListener } from './listeners/activity-group-added-listener';
import { randomBytes } from "crypto";
import { ActivityGroupRemovedListener } from "./listeners/activity-group-removed-listener";
import { ActivityGroupLeftListener } from "./listeners/activity-group-left-listener";
import { ActivityGroupUpdatedListener } from "./listeners/activity-group-updated-listener";

async function start() {
    const port = process.env.PORT || 3000;
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/activity';
    const natsClusterId = process.env.NATS_CLUSTER_ID || "chortec";
    const natsClientId =
        process.env.NATS_CLIENT_ID || randomBytes(4).toString("hex");
    const natsUrl = process.env.NATS_URL || "http://localhost:4222";
    try {
        await natsWrapper.connect(natsClusterId, natsClientId, natsUrl);
        new UserCreatedListener(natsWrapper.client).listen();
        new ActivityGroupCreatedListener(natsWrapper.client).listen();
        new ActivityGroupDeletedListener(natsWrapper.client).listen();
        new ActivityGroupAddedListener(natsWrapper.client).listen();
        new ActivityGroupRemovedListener(natsWrapper.client).listen();
        new ActivityGroupLeftListener(natsWrapper.client).listen();
        new ActivityGroupUpdatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.error(err);
    }

    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.log(err);
    }

    app.listen(port, () => console.log(`\x1b[32mServer is listening on port ${port}\x1b[0m`));
}

start();
