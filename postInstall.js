
/*
 * Copyright (c) 2026.  atagon GmbH.  All rights reserved.
 *
 * This file is part of the atagon codebase and may not be copied,
 *  distributed, or modified without explicit written permission from
 * atagon GmbH. https://www.atagon.com
 *
 *
 */

import {ensureBinary} from "./downloadeBinary.js";
import autoRegisterMCP from "./autoRegister.js";

await autoRegisterMCP()
await ensureBinary()
