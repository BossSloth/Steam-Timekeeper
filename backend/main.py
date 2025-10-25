import Millennium
from logger.logger import logger  # pylint: disable=import-error


class Plugin:
    def _front_end_loaded(self):
        pass

    def _load(self):
        logger.log(f"bootstrapping Steam Time Keeper, millennium {Millennium.version()}")

        Millennium.ready()  # this is required to tell Millennium that the backend is ready.

    def _unload(self):
        pass
