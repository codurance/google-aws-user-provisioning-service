import {GoogleUserSource} from "./google/users/GoogleUserSource";
import {AwsUserRepository} from "./aws/users/AwsUserRepository";
import {UserMapper} from "./UserMapper";
import {ConsoleLogger} from "./logging/ConsoleLogger";
import {GroupMapper} from "./GroupMapper";
import {AwsGroupRepository} from "./aws/groups/AwsGroupRepository";
import {GoogleGroupSource} from "./google/groups/GoogleGroupSource";
import {Fetcher} from "./Fetcher";
import {EnvBasedServiceConfig} from "./EnvBasedServiceConfig";
import assert from "assert";
const config = new EnvBasedServiceConfig();
assert(config.authenticationSubject);
assert(config.base64EncodedKeyFile);
assert(config.googleAppOrganisationId);
assert(config.scimToken);
assert(config.scimUrl);

const fetcher = new Fetcher();
const logger = new ConsoleLogger();
const awsUserRepository = new AwsUserRepository(config, fetcher);
const awsGroupRepository = new AwsGroupRepository(config, fetcher);
const googleUserSource = new GoogleUserSource(config);
const googleGroupSource = new GoogleGroupSource(config);
const userMapper = new UserMapper(awsUserRepository, googleUserSource, logger);
const groupMapper = new GroupMapper(awsGroupRepository, googleGroupSource, awsUserRepository, logger);

async function run(){
    await userMapper.mapUsersFromGoogleToAws();
    await groupMapper.mapGroupsFromGoogleToAws();
}

run();
