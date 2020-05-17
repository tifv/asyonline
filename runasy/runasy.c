#define _GNU_SOURCE

#include <stdio.h>
#include <unistd.h>

int
main (int argc, char **argv)
{
    (void) argc;
    uid_t uid = geteuid();
    if (setreuid(uid, uid) != 0) {
        perror("Failed to drop elevated priviliges");
        return 1;
    }

    argv[0] = "/usr/bin/asy";
    // Execute the target process
    execvp("/usr/bin/asy", argv);
    perror("Failed to execute the target process");
    return 1;
}

