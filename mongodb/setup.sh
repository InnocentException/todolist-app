mkdir data

# If SE Linux permission system is active like in fedora otherwise you can comment ths line out
chcon -Rt svirt_sandbox_file_t data
