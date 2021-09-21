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

    // Execute the target process
    execvp(argv[1], argv+1);
    perror("Failed to execute the target process");
    return 1;
}

