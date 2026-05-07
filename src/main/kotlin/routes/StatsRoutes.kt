get("/api/stats/summary") {
    val user = call.requireUser()

    fun Route.statsRoutes() {
    route("/api/stats") {
        get("/summary") {
            val user = call.requireUser() // Get logged-in user
            
            // In your StatsRoutes.kt
                val summary = dbQuery {
                    // We sum (weight * reps * sets) across all exercises for this user
                    val totalVolume = WorkoutExercises
                        .slice((WorkoutExercises.weight * WorkoutExercises.reps * WorkoutExercises.sets).sum())
                        .select { WorkoutExercises.userId eq user.id }
                        .singleOrNull()
                        ?.get((WorkoutExercises.weight * WorkoutExercises.reps * WorkoutExercises.sets).sum()) ?: 0
                    
                    DashboardStatsDto(totalWeight = totalVolume.toDouble(), workoutCount = count, timeElapsed = time)
                }

                // 2. Count Total Workouts
                val workoutCount = Workouts
                    .select { Workouts.userId eq user.id }
                    .count()

                // Return as a Data Transfer Object (DTO)
                DashboardStatsDto(
                    totalWeight = totalWeight.toDouble(),
                    workoutCount = workoutCount.toInt(),
                    timeElapsed = 0 // You can calculate this if you have start/end times
                )
            }
            call.respond(summary)
        }
    }
}
    
    val stats = dbQuery {
        // 1. Count total workouts this week
        val workoutCount = Workouts
            .select(Workouts.id.count())
            .where { (Workouts.userId eq user.id) and (Workouts.createdAt greaterEq oneWeekAgo()) }
            .singleOrNull()?.get(Workouts.id.count()) ?: 0

        // 2. Sum total weight moved
        // Assuming you have a 'weight' and 'reps' column in a WorkoutExercises table
        val totalWeight = WorkoutExercises
            .select(WorkoutExercises.weight.sum())
            .where { WorkoutExercises.userId eq user.id }
            .singleOrNull()?.get(WorkoutExercises.weight.sum()) ?: 0

        DashboardStatsDto(
            totalWeight = totalWeight,
            workoutCount = workoutCount.toInt(),
            timeElapsedMinutes = 0 // Calculate based on start/end times if available
        )
    }
    call.respond(stats)
}