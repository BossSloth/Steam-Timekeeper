import os.path as path

import Millennium
from logger.logger import logger  # pylint: disable=import-error


def GetPluginDir():
    return path.abspath(PLUGIN_BASE_DIR) # pylint: disable=undefined-variable

def GetComponentsPublicDir():
    return path.join(GetPluginDir(), 'components', 'public')

class Plugin:
    def _front_end_loaded(self):
        pass

    def _load(self):
        logger.log(f"bootstrapping Steam Time Keeper, millennium {Millennium.version()}")

        Millennium.ready()  # this is required to tell Millennium that the backend is ready.

    def _unload(self):
        pass
