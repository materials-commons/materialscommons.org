from faktory.client import Client


class StatusClient(Client):
    def status(self):
        try:
            if not self.is_connected:
                # connect if we are not already connected
                self.connect()

            self.faktory.reply("INFO")
            ret = next(self.faktory.get_message())
            return ret
        except ConnectionRefusedError as e:
            raise e
        finally:
            self.disconnect()
