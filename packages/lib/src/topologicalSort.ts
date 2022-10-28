/** @see https://gist.github.com/RubyTuesdayDONO/5006455 */
export function topologicalSort(graph: Record<string, Set<string>>) {
    const sorted: string[] = [], // sorted list of IDs ( returned value )
        visited: Record<string, boolean> = {}; // hash: id of already visited node => true

    function visit(name: string, ancestors: string[]) {
        if (!Array.isArray(ancestors)) ancestors = [];
        ancestors.push(name);
        visited[name] = true;

        if (graph[name]) {
            graph[name]!.forEach((dep) => {
                if (ancestors.includes(dep)) {
                    // if already in ancestors, a closed chain (recursive relation) exists
                    return;
                    // throw new Error(
                    //     'Circular dependency "' + dep + '" is required by "' + name + '": ' + ancestors.join(" -> ")
                    // );
                }

                // if already exists, do nothing
                if (visited[dep]) return;
                visit(dep, ancestors.slice(0)); // recursive call
            });
        }

        if (!sorted.includes(name)) sorted.push(name);
    }

    // 2. topological sort
    Object.keys(graph).forEach((name) => visit(name, []));

    return sorted;
}
